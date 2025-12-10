import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Find posts published 24 hours ago without insights
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const twentyFiveHoursAgo = new Date()
    twentyFiveHoursAgo.setHours(twentyFiveHoursAgo.getHours() - 25)

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, user_id, content, published_at')
      .eq('status', 'published')
      .gte('published_at', twentyFiveHoursAgo.toISOString())
      .lte('published_at', twentyFourHoursAgo.toISOString())

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No posts to analyze', generated: 0 })
    }

    // Filter out posts that already have insights
    const { data: existingInsights } = await supabase
      .from('post_insights')
      .select('post_id')
      .in('post_id', posts.map(p => p.id))

    const existingPostIds = new Set(existingInsights?.map(i => i.post_id) || [])
    const postsNeedingInsights = posts.filter(p => !existingPostIds.has(p.id))

    let generatedCount = 0
    const errors: string[] = []

    for (const post of postsNeedingInsights.slice(0, 10)) { // Limit to 10 per run
      try {
        // Get analytics
        const { data: analytics } = await supabase
          .from('post_analytics')
          .select('*')
          .eq('post_id', post.id)
          .order('synced_at', { ascending: false })
          .limit(1)
          .single()

        if (!analytics || analytics.views === 0) {
          continue // Skip if no analytics yet
        }

        // Get historical performance
        const { data: userPosts } = await supabase
          .from('posts')
          .select('id')
          .eq('user_id', post.user_id)
          .eq('status', 'published')
          .limit(20)

        const { data: historicalAnalytics } = await supabase
          .from('post_analytics')
          .select('views, likes, comments, shares')
          .in('post_id', userPosts?.map(p => p.id) || [])

        const avgEngagement = historicalAnalytics?.length ?
          historicalAnalytics.reduce((sum, a) =>
            sum + ((a.likes + a.comments + a.shares) / (a.views || 1)) * 100, 0
          ) / historicalAnalytics.length : 0

        const currentEngagement = ((analytics.likes + analytics.comments + analytics.shares) / analytics.views) * 100

        // Generate insights with AI
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `Analyze this LinkedIn post performance concisely.

Content: "${post.content.substring(0, 500)}"
Views: ${analytics.views}, Likes: ${analytics.likes}, Comments: ${analytics.comments}, Shares: ${analytics.shares}
Engagement: ${currentEngagement.toFixed(2)}% vs Historical Avg: ${avgEngagement.toFixed(2)}%

Provide ONLY valid JSON (no markdown):
{
  "autopsy_report": "Brief analysis",
  "success_factors": ["factor1"],
  "areas_for_improvement": ["improvement1"],
  "comparison_to_history": {
    "better_than_avg": ${currentEngagement > avgEngagement},
    "percentile": ${Math.round((currentEngagement / (avgEngagement || 1)) * 50)},
    "best_performing_element": "element",
    "underperforming_element": "element"
  },
  "key_learnings": ["learning1"],
  "recommended_actions": ["action1"]
}`

        const result = await model.generateContent(prompt)
        const response = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const insights = JSON.parse(response)

        // Save insights
        const { error: insertError } = await supabase
          .from('post_insights')
          .insert({
            post_id: post.id,
            ...insights,
            generated_at: new Date().toISOString()
          })

        if (insertError) {
          errors.push(`Post ${post.id}: ${insertError.message}`)
        } else {
          generatedCount++
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        errors.push(`Post ${post.id}: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    console.log(`✅ Post insights generated: ${generatedCount} posts analyzed`)

    return NextResponse.json({
      success: true,
      generated: generatedCount,
      eligible: postsNeedingInsights.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Post insights cron error:', error)
    return NextResponse.json({
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
