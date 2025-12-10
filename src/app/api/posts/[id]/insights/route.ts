import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.id

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status !== 'published') {
      return NextResponse.json({ error: 'Post must be published to generate insights' }, { status: 400 })
    }

    // Get post analytics
    const { data: analytics } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('post_id', postId)
      .order('synced_at', { ascending: false })
      .limit(1)
      .single()

    if (!analytics) {
      return NextResponse.json({ error: 'No analytics data available yet' }, { status: 400 })
    }

    // Get user's historical performance for comparison
    const { data: historicalPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    const { data: historicalAnalytics } = await supabase
      .from('post_analytics')
      .select('views, likes, comments, shares')
      .in('post_id', historicalPosts?.map(p => p.id) || [])

    const avgMetrics = historicalAnalytics?.reduce((acc, a) => ({
      views: acc.views + (a.views || 0),
      likes: acc.likes + (a.likes || 0),
      comments: acc.comments + (a.comments || 0),
      shares: acc.shares + (a.shares || 0)
    }), { views: 0, likes: 0, comments: 0, shares: 0 })

    const avgEngagement = historicalAnalytics?.length ?
      ((avgMetrics!.likes + avgMetrics!.comments + avgMetrics!.shares) / avgMetrics!.views) * 100 : 0

    const currentEngagement = analytics.views ?
      ((analytics.likes + analytics.comments + analytics.shares) / analytics.views) * 100 : 0

    // Generate AI insights using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const insightsPrompt = `You are an expert LinkedIn content strategist. Analyze this post's performance and provide actionable insights.

Post Content:
"""
${post.content}
"""

Performance Metrics:
- Views: ${analytics.views}
- Likes: ${analytics.likes}
- Comments: ${analytics.comments}
- Shares: ${analytics.shares}
- Engagement Rate: ${currentEngagement.toFixed(2)}%

Historical Average:
- Views: ${Math.round((avgMetrics?.views || 0) / (historicalAnalytics?.length || 1))}
- Engagement Rate: ${avgEngagement.toFixed(2)}%

Posted: ${post.published_at}

Provide a detailed analysis in this EXACT JSON format (no markdown, no code blocks):
{
  "autopsy_report": "<detailed markdown analysis of performance>",
  "success_factors": [
    "<specific element that worked well>",
    "<another success factor>"
  ],
  "areas_for_improvement": [
    "<specific thing to improve>",
    "<another improvement area>"
  ],
  "comparison_to_history": {
    "better_than_avg": <boolean>,
    "percentile": <number 0-100>,
    "best_performing_element": "<what worked best>",
    "underperforming_element": "<what didn't work>"
  },
  "key_learnings": [
    "<key takeaway 1>",
    "<key takeaway 2>"
  ],
  "recommended_actions": [
    "<specific action to take>",
    "<another recommended action>"
  ]
}`

    const result = await model.generateContent(insightsPrompt)
    const response = result.response.text()

    let insights
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      insights = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI insights:', response)
      throw new Error('Invalid AI response format')
    }

    // Save insights to database
    const { data: savedInsights, error: saveError } = await supabase
      .from('post_insights')
      .upsert({
        post_id: postId,
        autopsy_report: insights.autopsy_report,
        success_factors: insights.success_factors,
        areas_for_improvement: insights.areas_for_improvement,
        comparison_to_history: insights.comparison_to_history,
        key_learnings: insights.key_learnings,
        recommended_actions: insights.recommended_actions,
        generated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving insights:', saveError)
    }

    return NextResponse.json({
      insights: savedInsights || insights,
      analytics: {
        views: analytics.views,
        likes: analytics.likes,
        comments: analytics.comments,
        shares: analytics.shares,
        engagement_rate: Number(currentEngagement.toFixed(2))
      }
    })

  } catch (error) {
    console.error('Insights generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: insights, error } = await supabase
      .from('post_insights')
      .select('*')
      .eq('post_id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Insights not found' }, { status: 404 })
    }

    return NextResponse.json({ insights })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
