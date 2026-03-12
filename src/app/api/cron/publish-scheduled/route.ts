import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { postToLinkedIn } from '@/lib/linkedin/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return handleCron(request)
}

export async function POST(request: NextRequest) {
  return handleCron(request)
}

async function handleCron(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient()
    const now = new Date()

    // Find all posts that are scheduled and due to be published
    // Join with linkedin_accounts to get the valid token for the specific account
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        linkedin_accounts(
          linkedin_access_token,
          linkedin_user_id,
          is_active
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true })

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to publish',
        published: 0,
      })
    }

    const results = []

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        let account = post.linkedin_accounts
        
        // If account association is missing (older posts), try to find active account
        if (!account) {
          const { data: activeAccount } = await supabase
            .from('linkedin_accounts')
            .select('linkedin_access_token, linkedin_user_id, is_active')
            .eq('user_id', post.user_id)
            .eq('is_active', true)
            .limit(1)
            .single()
          
          if (activeAccount) {
            account = activeAccount
          }
        }

        if (!account || !account.is_active) {
          console.error(`No active LinkedIn account for post ${post.id}`)
          results.push({
            postId: post.id,
            success: false,
            error: 'No active LinkedIn account connected',
          })
          continue
        }

        const accessToken = account.linkedin_access_token

        if (!accessToken) {
          console.error(`No LinkedIn access token for post ${post.id}`)
          results.push({
            postId: post.id,
            success: false,
            error: 'No LinkedIn access token',
          })
          continue
        }

        // Post to LinkedIn using helper library
        const linkedInData = await postToLinkedIn(
          accessToken,
          account.linkedin_user_id,
          post.content
        )

        // Update post status to published
        await supabase
          .from('posts')
          .update({
            status: 'published',
            published_at: now.toISOString(),
            linkedin_post_id: linkedInData.id,
            updated_at: now.toISOString(),
          })
          .eq('id', post.id)

        // Log activity
        await supabase.from('user_activity_logs').insert({
          user_id: post.user_id,
          activity_type: 'post_published',
          activity_data: {
            post_id: post.id,
            linkedin_post_id: linkedInData.id,
            published_at: now.toISOString(),
            automated: true,
          },
        })

        results.push({
          postId: post.id,
          success: true,
          linkedInPostId: linkedInData.id,
        })
      } catch (error: any) {
        console.error(`Error publishing post ${post.id}:`, error)
        
        // Update post status to failed in database
        await supabase
          .from('posts')
          .update({
            status: 'failed',
            failed_reason: error.message || 'Unknown error during publishing',
            updated_at: now.toISOString(),
          })
          .eq('id', post.id)

        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Published ${successCount} of ${scheduledPosts.length} scheduled posts`,
      published: successCount,
      total: scheduledPosts.length,
      results,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run cron job' },
      { status: 500 }
    )
  }
}
