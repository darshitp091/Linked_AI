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

    // Get all users with active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, content_ideas_limit')
      .in('status', ['active', 'trialing'])
      .gt('content_ideas_limit', 0)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    let generatedCount = 0
    const errors: string[] = []

    for (const subscription of subscriptions || []) {
      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', subscription.user_id)
          .single()

        if (!profile) continue

        // Get trending topics
        const { data: trending } = await supabase
          .from('trending_topics')
          .select('topic, hashtag')
          .eq('velocity', 'rising')
          .limit(3)

        // Get recent posts
        const { data: recentPosts } = await supabase
          .from('posts')
          .select('content')
          .eq('user_id', subscription.user_id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5)

        // Generate content ideas
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `Generate 3 LinkedIn content ideas for ${profile.full_name || 'this user'}.

Industry: ${profile.company || 'General'}
Recent topics: ${recentPosts?.map(p => p.content.substring(0, 50)).join(', ') || 'None'}
Trending: ${trending?.map(t => t.topic).join(', ') || 'None'}

Provide ONLY valid JSON (no markdown):
{
  "ideas": [
    {
      "title": "Title",
      "description": "Description",
      "content_type": "article",
      "predicted_virality_score": 75
    }
  ]
}`

        const result = await model.generateContent(prompt)
        const response = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const generated = JSON.parse(response)

        // Save ideas
        const ideasToInsert = generated.ideas.map((idea: any) => ({
          user_id: subscription.user_id,
          title: idea.title,
          description: idea.description,
          content_type: idea.content_type,
          status: 'new',
          priority: idea.predicted_virality_score >= 70 ? 1 : 2,
          predicted_virality_score: idea.predicted_virality_score,
          auto_generated: true
        }))

        const { error: insertError } = await supabase
          .from('content_ideas')
          .insert(ideasToInsert)

        if (!insertError) {
          generatedCount++
        } else {
          errors.push(`User ${subscription.user_id}: ${insertError.message}`)
        }

        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        errors.push(`User ${subscription.user_id}: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    console.log(`✅ Content ideas generated for ${generatedCount} users`)

    return NextResponse.json({
      success: true,
      users_processed: generatedCount,
      total_users: subscriptions?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Content ideas cron error:', error)
    return NextResponse.json({
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
