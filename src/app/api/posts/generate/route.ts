import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePostVariations } from '@/lib/groq/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription and AI credits from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('posts_remaining, posts_used, subscription_plan')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 403 }
      )
    }

    if (profile.posts_remaining <= 0) {
      return NextResponse.json(
        { error: 'You have reached your monthly post limit. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { topic, style, tone, length, count = 3 } = body

    if (!topic || !style || !tone || !length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate posts using OpenAI
    const posts = await generatePostVariations(topic, style, tone, length, count)

    // Decrement posts_remaining in profile
    await supabase
      .from('profiles')
      .update({
        posts_remaining: profile.posts_remaining - 1,
        posts_used: (profile.posts_used || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      posts,
      remaining: profile.posts_remaining - 1,
    })
  } catch (error: any) {
    console.error('Error generating posts:', error)

    // Return user-friendly error messages
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts. Please try again.' },
      { status: 500 }
    )
  }
}
