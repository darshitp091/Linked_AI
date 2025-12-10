/**
 * Analytics Sync Scheduler
 * Automatically syncs analytics for all users on a schedule
 */

import { createAdminClient } from '@/lib/supabase/server'
import { syncAllPostAnalytics } from '@/lib/linkedin/analytics'

/**
 * Sync analytics for all active users
 * This should be called by a cron job or scheduled task
 */
export async function syncAnalyticsForAllUsers(): Promise<{
  success: boolean
  usersSynced: number
  totalSynced: number
  totalFailed: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const errors: string[] = []
  let usersSynced = 0
  let totalSynced = 0
  let totalFailed = 0

  try {
    console.log('[Analytics Sync] Starting scheduled analytics sync...')

    // Get all users with published posts that need syncing
    // We'll sync users who have posts published in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: users, error } = await supabase
      .from('posts')
      .select('user_id')
      .eq('status', 'published')
      .not('linkedin_post_id', 'is', null)
      .gte('published_at', thirtyDaysAgo.toISOString())
      .order('user_id')

    if (error) {
      throw error
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(users?.map((u: { user_id: string }) => u.user_id) || [])]
    console.log(`[Analytics Sync] Found ${uniqueUserIds.length} users with recent posts`)

    // Sync each user's analytics
    for (const userId of uniqueUserIds) {
      try {
        console.log(`[Analytics Sync] Syncing analytics for user ${userId}`)
        const result = await syncAllPostAnalytics(userId as string)

        if (result.success) {
          usersSynced++
          totalSynced += result.synced
          totalFailed += result.failed
          console.log(
            `[Analytics Sync] User ${userId}: ${result.synced} synced, ${result.failed} failed`
          )
        } else {
          errors.push(`User ${userId}: Sync failed`)
        }

        // Rate limiting - wait 5 seconds between users to avoid hitting LinkedIn API limits
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error: any) {
        console.error(`[Analytics Sync] Error syncing user ${userId}:`, error)
        errors.push(`User ${userId}: ${error.message}`)
      }
    }

    console.log(
      `[Analytics Sync] Completed. Users: ${usersSynced}, Posts synced: ${totalSynced}, Failed: ${totalFailed}`
    )

    return {
      success: true,
      usersSynced,
      totalSynced,
      totalFailed,
      errors,
    }
  } catch (error: any) {
    console.error('[Analytics Sync] Fatal error:', error)
    return {
      success: false,
      usersSynced,
      totalSynced,
      totalFailed,
      errors: [...errors, `Fatal error: ${error.message}`],
    }
  }
}

/**
 * Sync analytics for a specific user
 * Can be triggered manually or by webhook
 */
export async function syncAnalyticsForUser(
  userId: string
): Promise<{ success: boolean; synced: number; failed: number; error?: string }> {
  try {
    console.log(`[Analytics Sync] Manual sync for user ${userId}`)
    const result = await syncAllPostAnalytics(userId)
    console.log(`[Analytics Sync] User ${userId}: ${result.synced} synced, ${result.failed} failed`)
    return result
  } catch (error: any) {
    console.error(`[Analytics Sync] Error syncing user ${userId}:`, error)
    return {
      success: false,
      synced: 0,
      failed: 0,
      error: error.message,
    }
  }
}

/**
 * Get sync job status
 */
export async function getAnalyticsSyncStatus(userId: string): Promise<{
  lastSyncedAt: string | null
  totalPosts: number
  postsWithAnalytics: number
  needsSync: number
}> {
  const supabase = createAdminClient()

  try {
    // Get all published posts for the user
    const { data: posts } = await supabase
      .from('posts')
      .select(
        `
        id,
        linkedin_post_id,
        published_at,
        post_analytics (
          id,
          updated_at
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('linkedin_post_id', 'is', null)

    const totalPosts = posts?.length || 0
    const postsWithAnalytics = posts?.filter((p: { post_analytics: any }) => p.post_analytics).length || 0
    const needsSync = totalPosts - postsWithAnalytics

    // Get last sync time
    const { data: latestAnalytics } = await supabase
      .from('post_analytics')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    return {
      lastSyncedAt: latestAnalytics?.updated_at || null,
      totalPosts,
      postsWithAnalytics,
      needsSync,
    }
  } catch (error) {
    console.error('[Analytics Sync] Error getting sync status:', error)
    return {
      lastSyncedAt: null,
      totalPosts: 0,
      postsWithAnalytics: 0,
      needsSync: 0,
    }
  }
}
