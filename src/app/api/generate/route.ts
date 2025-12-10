import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInPost, generatePostVariations, generateTemplateVariations } from '@/lib/gemini/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { canGenerateAI } from '@/lib/usage/limits'

interface GeneratedPost {
  topic: string
  hook: string
  body: string
  cta: string
  full_post: string
  suggested_hashtags: string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limits
    const limitCheck = await canGenerateAI(user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.reason },
        { status: 403 }
      )
    }

    // Accept both old format (topic, count) and new format (topics, postsCount) for backward compatibility
    const body = await request.json()
    const {
      topic,
      topics,
      style = 'professional',
      tone = 'informative',
      length = 3,
      count,
      postsCount,
      template
    } = body

    // Normalize parameters
    const topicsArray = topics || (topic ? [topic] : [])
    const totalCount = postsCount || count || 1

    // Validate topics (not required if template is provided)
    if (!template && (!topicsArray || topicsArray.length === 0)) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const allGeneratedPosts: GeneratedPost[] = []

    // If template is provided, use template-based generation
    if (template) {
      const posts = await generateTemplateVariations(
        template,
        tone,
        totalCount,
        { topics: topicsArray }
      )

      // Format each post with structured data
      for (const postContent of posts) {
        const topicName = template.name || topicsArray[0] || 'Template Post'
        const formattedPost = formatPostContent(postContent, topicName)
        allGeneratedPosts.push(formattedPost)
      }
    } else {
      // Original topic-based generation
      const postsPerTopic = Math.max(1, Math.floor(totalCount / topicsArray.length))

      // Generate posts for each topic
      for (const topicItem of topicsArray) {
        let posts: string[]

        if (postsPerTopic > 1) {
          // Generate multiple variations
          posts = await generatePostVariations(topicItem, style, tone, length, postsPerTopic)
        } else {
          // Generate single post
          const post = await generateLinkedInPost(topicItem, style, tone, length)
          posts = [post]
        }

        // Format each post with structured data
        for (const postContent of posts) {
          const formattedPost = formatPostContent(postContent, topicItem)
          allGeneratedPosts.push(formattedPost)
        }

        // Break if we've reached the desired count
        if (allGeneratedPosts.length >= totalCount) {
          break
        }
      }
    }

    // Trim to exact count if we generated too many
    const finalPosts = allGeneratedPosts.slice(0, totalCount)

    // Deduct posts from remaining count
    const postsGenerated = finalPosts.length

    // Use admin client to update subscription usage (bypasses RLS)
    const adminClient = createAdminClient()

    // Get current usage and increment
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('ai_generations_used')
      .eq('user_id', user.id)
      .single()

    const newUsage = (subscription?.ai_generations_used || 0) + postsGenerated

    const { error: updateError } = await adminClient
      .from('subscriptions')
      .update({
        ai_generations_used: newUsage
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating subscription usage:', updateError)
      return NextResponse.json(
        { error: `Failed to update usage tracking: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: 'post_created',
      activity_data: {
        topics: topicsArray,
        style,
        tone,
        length,
        count: finalPosts.length,
        posts_generated: postsGenerated,
        template_used: template ? template.name : null
      },
    })

    return NextResponse.json({ posts: finalPosts, posts_generated: postsGenerated })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts' },
      { status: 500 }
    )
  }
}

// Helper function to format post content into structured data
function formatPostContent(content: string, topic: string): GeneratedPost {
  const lines = content.split('\n').filter(line => line.trim())

  // Extract hook (first meaningful line)
  const hook = lines[0] || ''

  // Extract body (middle paragraphs)
  const bodyLines = lines.slice(1, -1)
  const body = bodyLines.join('\n\n')

  // Extract CTA (last line or sentence)
  const cta = lines[lines.length - 1] || ''

  // Extract hashtags from content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []
  const suggested_hashtags = [...new Set(hashtags)] // Remove duplicates

  // If no hashtags in content, suggest some based on topic
  if (suggested_hashtags.length === 0) {
    const topicWords = topic.split(' ').map(word =>
      '#' + word.replace(/[^a-zA-Z0-9]/g, '')
    )
    suggested_hashtags.push(...topicWords.slice(0, 3))
  }

  return {
    topic,
    hook: hook.replace(hashtagRegex, '').trim(),
    body: body.replace(hashtagRegex, '').trim(),
    cta: cta.replace(hashtagRegex, '').trim(),
    full_post: content,
    suggested_hashtags
  }
}
