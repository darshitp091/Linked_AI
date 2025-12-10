import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { PredictionSuggestion, PredictionFactors } from '@/lib/predictions/types'

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

    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user has viral prediction limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, viral_predictions_limit')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 403 })
    }

    // Check current month's usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: currentUsage } = await supabase
      .from('post_predictions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .gte('created_at', startOfMonth.toISOString())

    // For free users, limit predictions
    if (subscription.plan === 'free' && (currentUsage || 0) >= subscription.viral_predictions_limit) {
      return NextResponse.json({
        error: 'Viral prediction limit reached',
        limit: subscription.viral_predictions_limit
      }, { status: 429 })
    }

    // Fetch user's historical post performance for comparison
    const { data: historicalPosts } = await supabase
      .from('posts')
      .select('id, content')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10)

    const { data: analytics } = await supabase
      .from('post_analytics')
      .select('post_id, views, likes, comments, shares')
      .in('post_id', historicalPosts?.map(p => p.id) || [])

    // Calculate average performance
    const avgMetrics = analytics?.reduce((acc, a) => ({
      views: acc.views + (a.views || 0),
      likes: acc.likes + (a.likes || 0),
      comments: acc.comments + (a.comments || 0),
      shares: acc.shares + (a.shares || 0)
    }), { views: 0, likes: 0, comments: 0, shares: 0 })

    const avgEngagementRate = analytics?.length ?
      ((avgMetrics!.likes + avgMetrics!.comments + avgMetrics!.shares) / avgMetrics!.views) * 100 : 0

    // Use Gemini AI to analyze the post and predict virality
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const analysisPrompt = `You are an expert LinkedIn content analyst. Analyze this LinkedIn post and predict its virality score.

Post Content:
"""
${post.content}
"""

Historical Average Performance:
- Views: ${avgMetrics ? Math.round(avgMetrics.views / (analytics?.length || 1)) : 0}
- Likes: ${avgMetrics ? Math.round(avgMetrics.likes / (analytics?.length || 1)) : 0}
- Comments: ${avgMetrics ? Math.round(avgMetrics.comments / (analytics?.length || 1)) : 0}
- Engagement Rate: ${avgEngagementRate.toFixed(2)}%

Analyze the following factors (score each 0-100):
1. Hook Quality: Is the opening compelling?
2. Content Structure: Is it well-organized and scannable?
3. CTA Strength: Does it have a clear call-to-action?
4. Hashtag Relevance: Are hashtags relevant and trending?
5. Optimal Length: Is the length appropriate (100-1500 chars)?
6. Topic Relevance: Is the topic timely and relevant?
7. Media Quality: If media is mentioned, assess quality

Provide your response in this EXACT JSON format (no markdown, no code blocks):
{
  "virality_score": <number 0-100>,
  "confidence_level": "<low|medium|high>",
  "predicted_views": <number>,
  "predicted_likes": <number>,
  "predicted_comments": <number>,
  "predicted_shares": <number>,
  "predicted_engagement_rate": <number>,
  "factors": {
    "hook_quality": <number 0-100>,
    "content_structure": <number 0-100>,
    "cta_strength": <number 0-100>,
    "hashtag_relevance": <number 0-100>,
    "optimal_length": <boolean>,
    "optimal_timing": <boolean>,
    "media_quality": <number 0-100>,
    "topic_relevance": <number 0-100>
  },
  "suggestions": [
    {
      "type": "<hook|structure|cta|hashtags|length|timing|media>",
      "priority": "<high|medium|low>",
      "message": "<specific suggestion>",
      "expected_improvement": <percentage number>
    }
  ]
}`

    const result = await model.generateContent(analysisPrompt)
    const response = result.response.text()

    // Parse AI response
    let prediction
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      prediction = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', response)
      throw new Error('Invalid AI response format')
    }

    // Store prediction in database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('post_predictions')
      .upsert({
        post_id: postId,
        virality_score: prediction.virality_score,
        predicted_views: prediction.predicted_views,
        predicted_likes: prediction.predicted_likes,
        predicted_comments: prediction.predicted_comments,
        predicted_shares: prediction.predicted_shares,
        predicted_engagement_rate: prediction.predicted_engagement_rate,
        confidence_level: prediction.confidence_level,
        suggestions: prediction.suggestions,
        prediction_factors: prediction.factors
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving prediction:', saveError)
    }

    return NextResponse.json({
      prediction: savedPrediction || prediction,
      comparison: {
        vs_user_average: prediction.virality_score - 50,
        vs_industry_average: prediction.virality_score - 60
      }
    })

  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({
      error: 'Failed to generate prediction',
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

    const { data: prediction, error } = await supabase
      .from('post_predictions')
      .select('*')
      .eq('post_id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })
    }

    return NextResponse.json({ prediction })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
