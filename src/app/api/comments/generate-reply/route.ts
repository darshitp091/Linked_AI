import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, comment_id, comment_text, commenter_name, tone = 'professional' } = body

    if (!comment_text) {
      return NextResponse.json({ error: 'Comment text required' }, { status: 400 })
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, auto_engagements_limit')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.auto_engagements_limit === 0) {
      return NextResponse.json({
        error: 'AI comment replies not available in your plan',
        upgrade_required: true
      }, { status: 403 })
    }

    // Check monthly usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyUsage } = await supabase
      .from('comment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id)
      .gte('created_at', startOfMonth.toISOString())

    if ((monthlyUsage || 0) >= subscription.auto_engagements_limit) {
      return NextResponse.json({
        error: 'Monthly AI reply limit reached',
        limit: subscription.auto_engagements_limit,
        used: monthlyUsage
      }, { status: 429 })
    }

    // Get post context
    const { data: post } = await supabase
      .from('posts')
      .select('content')
      .eq('id', post_id)
      .eq('user_id', user.id)
      .single()

    // Get user profile for brand voice
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, bio')
      .eq('id', user.id)
      .single()

    // Analyze comment sentiment
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const analyzePrompt = `Analyze this LinkedIn comment and determine its sentiment and intent.

Comment: "${comment_text}"
Commenter: ${commenter_name || 'Unknown'}

Provide response in this EXACT JSON format (no markdown):
{
  "sentiment": "<positive|neutral|negative|question>",
  "intent": "<question|praise|criticism|discussion|spam>",
  "requires_response": <boolean>,
  "urgency": "<high|medium|low>",
  "key_topics": ["<topic1>", "<topic2>"]
}`

    const analysisResult = await model.generateContent(analyzePrompt)
    const analysisText = analysisResult.response.text()
    const analysis = JSON.parse(analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    // Generate reply
    const replyPrompt = `You are ${profile?.full_name || 'a professional'}. Generate a thoughtful reply to this LinkedIn comment.

Original Post:
"${post?.content || 'N/A'}"

Comment from ${commenter_name || 'someone'}:
"${comment_text}"

Comment Analysis:
- Sentiment: ${analysis.sentiment}
- Intent: ${analysis.intent}

Generate a reply that is:
- Tone: ${tone}
- Length: 1-3 sentences
- Authentic and helpful
- Encourages further engagement if appropriate

Provide ONLY the reply text, no JSON, no extra formatting.`

    const replyResult = await model.generateContent(replyPrompt)
    const generatedReply = replyResult.response.text().trim()

    // Save to database
    const { data: savedResponse, error: saveError } = await supabase
      .from('comment_responses')
      .insert({
        post_id,
        comment_id,
        comment_text,
        commenter_name,
        generated_reply: generatedReply,
        sentiment: analysis.sentiment,
        posted_to_linkedin: false
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving comment response:', saveError)
    }

    return NextResponse.json({
      generated_reply: generatedReply,
      analysis,
      response_id: savedResponse?.id,
      remaining_limit: subscription.auto_engagements_limit - (monthlyUsage || 0) - 1
    })

  } catch (error) {
    console.error('Comment reply generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate reply',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
