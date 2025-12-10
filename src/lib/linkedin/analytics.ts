/**
 * LinkedIn Analytics Integration
 * Fetches post analytics from LinkedIn API
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface LinkedInPostAnalytics {
  postId: string
  linkedinPostId: string
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  engagement: number
  engagementRate: number
  clickThroughRate: number
  fetchedAt: string
}

export interface LinkedInFollowerAnalytics {
  totalFollowers: number
  followerGrowth: number
  followerGrowthRate: number
  period: string
}

/**
 * Fetch analytics for a single LinkedIn post
 */
export async function fetchLinkedInPostAnalytics(
  accessToken: string,
  linkedinPostId: string
): Promise<LinkedInPostAnalytics | null> {
  try {
    // LinkedIn Analytics API endpoint
    // Note: This is a simplified version. Real LinkedIn API requires proper URN format
    const response = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${linkedinPostId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    )

    if (!response.ok) {
      console.error('LinkedIn API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()

    // Parse LinkedIn response
    const stats = data.elements?.[0]?.totalShareStatistics || {}

    const impressions = stats.impressionCount || 0
    const clicks = stats.clickCount || 0
    const likes = stats.likeCount || 0
    const comments = stats.commentCount || 0
    const shares = stats.shareCount || 0

    const engagement = likes + comments + shares
    const engagementRate = impressions > 0 ? (engagement / impressions) * 100 : 0
    const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0

    return {
      postId: '', // Will be set by caller
      linkedinPostId,
      impressions,
      clicks,
      likes,
      comments,
      shares,
      engagement,
      engagementRate,
      clickThroughRate,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching LinkedIn analytics:', error)
    return null
  }
}

/**
 * Sync analytics for a specific post
 */
export async function syncPostAnalytics(
  postId: string,
  userId: string
): Promise<{ success: boolean; analytics?: LinkedInPostAnalytics; error?: string }> {
  const supabase = createAdminClient()

  try {
    // Get post with LinkedIn ID and user's access token
    const { data: post } = await supabase
      .from('posts')
      .select('linkedin_post_id, linkedin_account_id')
      .eq('id', postId)
      .eq('user_id', userId)
      .single()

    if (!post?.linkedin_post_id) {
      return { success: false, error: 'Post not published to LinkedIn' }
    }

    // Get LinkedIn access token
    const { data: account } = await supabase
      .from('linkedin_accounts')
      .select('linkedin_access_token')
      .eq('id', post.linkedin_account_id || '')
      .single()

    if (!account?.linkedin_access_token) {
      return { success: false, error: 'LinkedIn account not found or token expired' }
    }

    // Fetch analytics from LinkedIn
    const analytics = await fetchLinkedInPostAnalytics(
      account.linkedin_access_token,
      post.linkedin_post_id
    )

    if (!analytics) {
      return { success: false, error: 'Failed to fetch analytics from LinkedIn' }
    }

    analytics.postId = postId

    // Store in database
    await supabase
      .from('post_analytics')
      .upsert({
        post_id: postId,
        views: analytics.impressions,
        likes: analytics.likes,
        comments: analytics.comments,
        shares: analytics.shares,
        clicks: analytics.clicks,
        engagement_rate: analytics.engagementRate,
        click_through_rate: analytics.clickThroughRate,
        updated_at: new Date().toISOString(),
      })

    return { success: true, analytics }
  } catch (error: any) {
    console.error('Error syncing post analytics:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sync analytics for all published posts
 */
export async function syncAllPostAnalytics(
  userId: string
): Promise<{ success: boolean; synced: number; failed: number }> {
  const supabase = createAdminClient()

  try {
    // Get all published posts with LinkedIn IDs
    const { data: posts } = await supabase
      .from('posts')
      .select('id, linkedin_post_id')
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('linkedin_post_id', 'is', null)

    if (!posts || posts.length === 0) {
      return { success: true, synced: 0, failed: 0 }
    }

    let synced = 0
    let failed = 0

    for (const post of posts) {
      const result = await syncPostAnalytics(post.id, userId)
      if (result.success) {
        synced++
      } else {
        failed++
      }

      // Rate limiting - wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return { success: true, synced, failed }
  } catch (error) {
    console.error('Error syncing all analytics:', error)
    return { success: false, synced: 0, failed: 0 }
  }
}

/**
 * Get aggregated analytics for a user
 */
export async function getUserAnalyticsSummary(userId: string): Promise<{
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgEngagementRate: number
  topPost?: any
}> {
  const supabase = createAdminClient()

  try {
    // Get all published posts with analytics
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        published_at,
        post_analytics (
          views,
          likes,
          comments,
          shares,
          engagement_rate
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('published_at', 'is', null)

    if (!posts || posts.length === 0) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagementRate: 0,
      }
    }

    let totalViews = 0
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0
    let totalEngagementRate = 0
    let postsWithAnalytics = 0
    let topPost: any = null
    let maxEngagement = 0

    for (const post of posts) {
      const analytics = Array.isArray(post.post_analytics)
        ? post.post_analytics[0]
        : post.post_analytics

      if (analytics) {
        totalViews += analytics.views || 0
        totalLikes += analytics.likes || 0
        totalComments += analytics.comments || 0
        totalShares += analytics.shares || 0
        totalEngagementRate += analytics.engagement_rate || 0
        postsWithAnalytics++

        const engagement = (analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0)
        if (engagement > maxEngagement) {
          maxEngagement = engagement
          topPost = {
            ...post,
            analytics,
          }
        }
      }
    }

    return {
      totalPosts: posts.length,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate: postsWithAnalytics > 0 ? totalEngagementRate / postsWithAnalytics : 0,
      topPost,
    }
  } catch (error) {
    console.error('Error getting analytics summary:', error)
    return {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      avgEngagementRate: 0,
    }
  }
}

/**
 * Get analytics trend data (last 30 days)
 */
export async function getAnalyticsTrend(userId: string, days: number = 30) {
  const supabase = createAdminClient()

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        published_at,
        post_analytics (
          views,
          likes,
          comments,
          shares,
          engagement_rate
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'published')
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: true })

    if (!posts) return []

    // Group by date
    const trendData: Record<string, any> = {}

    for (const post of posts) {
      const date = new Date(post.published_at).toISOString().split('T')[0]
      const analytics = Array.isArray(post.post_analytics)
        ? post.post_analytics[0]
        : post.post_analytics

      if (!trendData[date]) {
        trendData[date] = {
          date,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          posts: 0,
        }
      }

      if (analytics) {
        trendData[date].views += analytics.views || 0
        trendData[date].likes += analytics.likes || 0
        trendData[date].comments += analytics.comments || 0
        trendData[date].shares += analytics.shares || 0
        trendData[date].posts += 1
      }
    }

    return Object.values(trendData)
  } catch (error) {
    console.error('Error getting analytics trend:', error)
    return []
  }
}
