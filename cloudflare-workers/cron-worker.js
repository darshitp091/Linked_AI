/**
 * Cloudflare Workers Cron Triggers - COMPLETE
 *
 * This worker handles ALL scheduled tasks for LinkedIn Scheduler.
 * Cloudflare Workers = UNLIMITED cron jobs (vs Vercel's 2/day limit)
 *
 * Cron Schedule:
 * - Post Publishing: Every 15 minutes
 * - Analytics Sync: Every 6 hours
 * - Follower Sync: Daily at 2 AM UTC
 * - Post Insights: Every hour
 * - Content Ideas: Weekly (Sunday 8 AM UTC)
 * - Trending Topics: Every 12 hours
 *
 * Setup:
 * 1. wrangler login
 * 2. wrangler secret put CRON_SECRET
 * 3. wrangler deploy
 */

export default {
  /**
   * Scheduled event handler
   * Triggered by Cloudflare Cron Triggers (every 15 minutes)
   */
  async scheduled(event, env, ctx) {
    const now = new Date()
    const minute = now.getUTCMinutes()
    const hour = now.getUTCHours()
    const day = now.getUTCDay() // 0 = Sunday

    console.log(`[Cron] Triggered at ${now.toISOString()}`)

    // Publish Scheduled Posts - Every 15 minutes
    if (minute % 15 === 0) {
      console.log('[Cron] Running: Publish Scheduled Posts')
      ctx.waitUntil(publishScheduledPosts(env))
    }

    // Sync Analytics - Every 6 hours
    if (hour % 6 === 0 && minute === 0) {
      console.log('[Cron] Running: Sync Analytics')
      ctx.waitUntil(syncAnalytics(env))
    }

    // Follower Growth Sync - Daily at 2 AM UTC
    if (hour === 2 && minute === 0) {
      console.log('[Cron] Running: Follower Sync')
      ctx.waitUntil(syncFollowers(env))
    }

    // Post Insights Generation - Every hour
    if (minute === 0) {
      console.log('[Cron] Running: Post Insights')
      ctx.waitUntil(generatePostInsights(env))
    }

    // Content Ideas - Weekly on Sunday at 8 AM UTC
    if (day === 0 && hour === 8 && minute === 0) {
      console.log('[Cron] Running: Content Ideas')
      ctx.waitUntil(generateContentIdeas(env))
    }

    // Trending Topics Update - Every 12 hours
    if (hour % 12 === 0 && minute === 0) {
      console.log('[Cron] Running: Trending Topics')
      ctx.waitUntil(updateTrendingTopics(env))
    }
  },

  /**
   * HTTP handler for manual triggers and testing
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        worker: 'cron-worker',
        jobs: [
          'publish-scheduled (15min)',
          'sync-analytics (6hr)',
          'sync-followers (daily 2am)',
          'post-insights (hourly)',
          'content-ideas (weekly sun 8am)',
          'trending-topics (12hr)'
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Manual triggers for testing
    const triggers = {
      '/trigger/publish': publishScheduledPosts,
      '/trigger/analytics': syncAnalytics,
      '/trigger/followers': syncFollowers,
      '/trigger/insights': generatePostInsights,
      '/trigger/ideas': generateContentIdeas,
      '/trigger/trending': updateTrendingTopics
    }

    if (request.method === 'POST' && triggers[url.pathname]) {
      const result = await triggers[url.pathname](env)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Cloudflare Workers Cron - LinkedIn Scheduler\n\nAvailable endpoints:\n- /health\n- /trigger/publish\n- /trigger/analytics\n- /trigger/followers\n- /trigger/insights\n- /trigger/ideas\n- /trigger/trending', {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

/**
 * Publish Scheduled Posts
 * Calls the API endpoint to publish posts scheduled for now
 */
async function publishScheduledPosts(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/publish-scheduled', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Publish] Status:', response.status)
    console.log('[Publish] Response:', JSON.stringify(data))

    return {
      job: 'publish-scheduled-posts',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Publish] Error:', error.message)
    return {
      job: 'publish-scheduled-posts',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Sync Analytics
 * Calls the API endpoint to sync LinkedIn analytics
 */
async function syncAnalytics(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/sync-analytics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Analytics] Status:', response.status)
    console.log('[Analytics] Response:', JSON.stringify(data))

    return {
      job: 'sync-analytics',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Analytics] Error:', error.message)
    return {
      job: 'sync-analytics',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Sync Follower Counts
 * Daily sync of LinkedIn follower growth
 */
async function syncFollowers(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/follower-sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Followers] Status:', response.status)
    console.log('[Followers] Response:', JSON.stringify(data))

    return {
      job: 'sync-followers',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Followers] Error:', error.message)
    return {
      job: 'sync-followers',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Generate Post Insights
 * AI analysis of published posts
 */
async function generatePostInsights(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/post-insights', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Insights] Status:', response.status)
    console.log('[Insights] Response:', JSON.stringify(data))

    return {
      job: 'post-insights',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Insights] Error:', error.message)
    return {
      job: 'post-insights',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Generate Content Ideas
 * Weekly AI-powered content suggestions
 */
async function generateContentIdeas(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/content-ideas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Ideas] Status:', response.status)
    console.log('[Ideas] Response:', JSON.stringify(data))

    return {
      job: 'content-ideas',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Ideas] Error:', error.message)
    return {
      job: 'content-ideas',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Update Trending Topics
 * Refresh trending topics database
 */
async function updateTrendingTopics(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/trending-topics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Trending] Status:', response.status)
    console.log('[Trending] Response:', JSON.stringify(data))

    return {
      job: 'trending-topics',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Trending] Error:', error.message)
    return {
      job: 'trending-topics',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
