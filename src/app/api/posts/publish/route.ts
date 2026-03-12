import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get LinkedIn access token from the associated account
    const { data: account, error: accountError } = await supabase
      .from('linkedin_accounts')
      .select('linkedin_access_token, linkedin_user_id, is_active')
      .eq('id', post.linkedin_account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account || !account.is_active) {
      return NextResponse.json(
        { error: 'Associated LinkedIn account not found or inactive. Please check your settings.' },
        { status: 403 }
      )
    }

    if (!account.linkedin_access_token) {
      return NextResponse.json(
        { error: 'LinkedIn access token not found. Please reconnect your LinkedIn account.' },
        { status: 403 }
      )
    }

    // Publish to LinkedIn using helper
    const { postToLinkedIn } = await import('@/lib/linkedin/client')
    try {
      const linkedInData = await postToLinkedIn(
        account.linkedin_access_token,
        account.linkedin_user_id,
        post.content
      )

      // Update post status in database
      await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          linkedin_post_id: linkedInData.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)

      return NextResponse.json({
        success: true,
        linkedInPostId: linkedInData.id,
        message: 'Post published to LinkedIn successfully',
      })
    } catch (linkedInError: any) {
      console.error('LinkedIn publishing error:', linkedInError)
      return NextResponse.json(
        { error: linkedInError.message || 'Failed to publish to LinkedIn' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error publishing post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    )
  }
}
