import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_analytics (
          views,
          likes,
          comments,
          shares,
          clicks,
          engagement_rate,
          click_through_rate,
          updated_at
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Post detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
