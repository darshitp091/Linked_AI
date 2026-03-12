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

    // Verify profile exists (optional, but good for error reporting)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please try logging out and in again.' },
        { status: 404 }
      )
    }

    // Insert post into database using admin client (bypasses RLS)
    const adminClient = createAdminClient()
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
