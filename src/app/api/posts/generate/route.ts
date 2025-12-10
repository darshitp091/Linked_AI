import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePostVariations } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription and AI credits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 403 }
      )
    }

    if (subscription.posts_remaining <= 0) {
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

    // Decrement posts_remaining
    await supabase
      .from('subscriptions')
      .update({
        posts_remaining: subscription.posts_remaining - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      posts,
      remaining: subscription.posts_remaining - 1,
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
