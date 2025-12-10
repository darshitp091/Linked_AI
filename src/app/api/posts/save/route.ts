import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, topic, status = 'draft' } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Use admin client to ensure profile exists (bypasses RLS)
    const adminClient = createAdminClient()

    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      // Create profile using admin client (bypasses RLS)
      const { error: profileError } = await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        subscription_plan: 'free',
        posts_remaining: 5,
        posts_limit: 5,
        posts_used: 0,
        linkedin_connected: false,
        google_calendar_enabled: false,
      })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json(
          { error: `Failed to create user profile: ${profileError.message}` },
          { status: 500 }
        )
      }
    }

    // Insert post into database using admin client (bypasses RLS)
    const { data: post, error } = await adminClient
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        topic,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving post:', error)
      return NextResponse.json(
        { error: `Failed to save post: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error: any) {
    console.error('Error saving post:', error)
    return NextResponse.json(
      { error: `Failed to save post: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
