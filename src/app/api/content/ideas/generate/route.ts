import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Admin client for subscription management (bypasses RLS)
async function getAdminClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limits - create default if not exists
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, content_ideas_limit')
      .eq('user_id', user.id)
      .single()

    // If no subscription exists, create a free plan subscription using admin client
    if (!subscription) {
      try {
        const adminClient = await getAdminClient()
        const { data: newSubscription, error: createError } = await adminClient
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            status: 'active',
            content_ideas_limit: 5
          })
          .select('plan, content_ideas_limit')
          .single()

        if (createError) {
          console.error('Error creating subscription:', createError)
          // Continue anyway with default free plan
          subscription = { plan: 'free', content_ideas_limit: 5 }
        } else {
          subscription = newSubscription
        }
      } catch (adminError) {
        console.error('Admin client error:', adminError)
        // Continue anyway with default free plan
        subscription = { plan: 'free', content_ideas_limit: 5 }
      }
    }

    // Get user's profile and posting history
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('content, created_at')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10)

    // Get trending topics
    const { data: trending } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('velocity', 'rising')
      .order('trend_score', { ascending: false })
      .limit(5)

    // Get top performing posts to understand what works
    const { data: topPosts } = await supabase
      .from('posts')
      .select('id, content')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .limit(5)

    const { data: topAnalytics } = await supabase
      .from('post_analytics')
      .select('post_id, views, likes, comments')
      .in('post_id', topPosts?.map(p => p.id) || [])
      .order('likes', { ascending: false })
      .limit(3)

    // Generate content ideas using AI or fallback
    let generatedIdeas

    try {
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' })

      const ideaPrompt = `You are a LinkedIn content strategist. Generate 5 personalized content ideas.

User Profile:
- Name: ${profile?.full_name || 'Unknown'}
- Bio: ${profile?.bio || 'Not provided'}
- Industry: ${profile?.company || 'General'}

Recent Posts Topics:
${recentPosts?.slice(0, 5).map(p => `- "${p.content.substring(0, 100)}..."`).join('\n') || 'None'}

Trending Topics:
${trending?.map(t => `- ${t.topic} (${t.hashtag})`).join('\n') || 'None'}

Generate 5 unique content ideas that:
1. Are different from recent posts (avoid repetition)
2. Leverage trending topics when relevant
3. Match the user's professional brand
4. Have high engagement potential
5. Are actionable and specific

Provide response in this EXACT JSON format (no markdown):
{
  "ideas": [
    {
      "title": "<catchy title>",
      "description": "<2-3 sentence description>",
      "content_type": "<article|story|tips|question|announcement>",
      "reasoning": "<why this will perform well>",
      "suggested_hooks": ["<hook 1>", "<hook 2>"],
      "relevant_hashtags": ["<tag1>", "<tag2>", "<tag3>"],
      "predicted_virality_score": <number 0-100>,
      "trending_topic_id": "<topic from trending list or null>"
    }
  ]
}`

      const result = await model.generateContent(ideaPrompt)
      const response = result.response.text()

      try {
        const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        generatedIdeas = JSON.parse(cleanedResponse)
      } catch (parseError) {
        console.error('Failed to parse AI ideas:', response)
        throw new Error('Invalid AI response format')
      }
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError)
      // Fallback to template-based ideas when AI fails
      generatedIdeas = {
        ideas: [
          {
            title: "Share Your Biggest Lesson from This Week",
            description: "Reflect on a key takeaway or insight you gained recently. Share what you learned and how it changed your perspective on your work or industry.",
            content_type: "story",
            reasoning: "Personal stories with lessons learned tend to generate high engagement",
            suggested_hooks: ["This week taught me something powerful...", "I made a mistake that turned into my biggest lesson", "Here's what I learned the hard way"],
            relevant_hashtags: ["#LessonsLearned", "#GrowthMindset", "#CareerDevelopment"],
            predicted_virality_score: 75,
            trending_topic_id: null
          },
          {
            title: "5 Quick Tips to Boost Your Productivity",
            description: "Share actionable productivity hacks that have helped you get more done. Focus on simple, implementable strategies your network can use immediately.",
            content_type: "tips",
            reasoning: "List-based content performs well and provides immediate value",
            suggested_hooks: ["Want to get 10x more done? Try these", "These 5 hacks changed my work life", "Stop wasting time - do this instead"],
            relevant_hashtags: ["#Productivity", "#WorkSmart", "#TimeManagement"],
            predicted_virality_score: 80,
            trending_topic_id: null
          },
          {
            title: "Ask Your Network for Their Best Advice",
            description: "Pose a thoughtful question to your network about a challenge you're facing or topic you're exploring. Encourage discussion and engagement.",
            content_type: "question",
            reasoning: "Questions drive comments and create conversation",
            suggested_hooks: ["I need your help with something...", "Question for my network:", "What's your take on this?"],
            relevant_hashtags: ["#AskLinkedIn", "#CommunityWisdom", "#Collaboration"],
            predicted_virality_score: 70,
            trending_topic_id: null
          },
          {
            title: "Behind the Scenes of Your Daily Work",
            description: "Give your audience a peek into your daily routine, workflow, or a recent project. Show the human side of your professional life.",
            content_type: "story",
            reasoning: "Authentic behind-the-scenes content builds connection",
            suggested_hooks: ["Here's what my day actually looks like", "Nobody talks about this part of the job", "A day in the life as a [your role]"],
            relevant_hashtags: ["#DayInTheLife", "#BehindTheScenes", "#RealTalk"],
            predicted_virality_score: 65,
            trending_topic_id: null
          },
          {
            title: "Announce a Milestone or Achievement",
            description: "Share a recent win, project completion, or personal milestone. Celebrate progress and inspire others with your journey.",
            content_type: "announcement",
            reasoning: "Celebratory posts receive congratulations and engagement",
            suggested_hooks: ["I'm excited to share that...", "Big news I've been waiting to announce", "We did it! Here's the story"],
            relevant_hashtags: ["#Milestone", "#Achievement", "#Gratitude"],
            predicted_virality_score: 72,
            trending_topic_id: null
          }
        ]
      }
    }

    // Save ideas to database
    const ideasToInsert = generatedIdeas.ideas.map((idea: any) => ({
      user_id: user.id,
      title: idea.title,
      description: `${idea.description}\n\n**Reasoning:** ${idea.reasoning}\n\n**Suggested Hooks:**\n${idea.suggested_hooks.map((h: string) => `- ${h}`).join('\n')}\n\n**Hashtags:** ${idea.relevant_hashtags.join(' ')}`,
      content_type: idea.content_type,
      status: 'new',
      priority: idea.predicted_virality_score >= 70 ? 1 : idea.predicted_virality_score >= 50 ? 2 : 3,
      predicted_virality_score: idea.predicted_virality_score,
      auto_generated: true
    }))

    const { data: savedIdeas, error: saveError } = await supabase
      .from('content_ideas')
      .insert(ideasToInsert)
      .select()

    if (saveError) {
      console.error('Error saving content ideas:', saveError)
    }

    return NextResponse.json({
      ideas: savedIdeas || generatedIdeas.ideas,
      count: savedIdeas?.length || generatedIdeas.ideas.length,
      message: 'Content ideas generated successfully'
    })

  } catch (error) {
    console.error('Content ideas generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate content ideas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET: Fetch existing content ideas
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'new'
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data: ideas, error } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('priority', { ascending: true })
      .order('predicted_virality_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching content ideas:', error)
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
    }

    return NextResponse.json({ ideas })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
