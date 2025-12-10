import { createClient } from '@/lib/supabase/server'

export const PLAN_LIMITS = {
  free: {
    postsPerMonth: 5,
    linkedinAccounts: 1,
    aiGenerations: 10,
    scheduledPosts: 5,
  },
  pro: {
    postsPerMonth: 100,
    linkedinAccounts: 5,
    aiGenerations: 200,
    scheduledPosts: 100,
  },
  standard: {
    postsPerMonth: 500,
    linkedinAccounts: 10,
    aiGenerations: 1000,
    scheduledPosts: 500,
  },
  custom: {
    postsPerMonth: Infinity,
    linkedinAccounts: Infinity,
    aiGenerations: Infinity,
    scheduledPosts: Infinity,
  },
}

export type PlanType = keyof typeof PLAN_LIMITS

export interface UsageStats {
  postsThisMonth: number
  aiGenerationsThisMonth: number
  linkedinAccountsConnected: number
  scheduledPostsCount: number
}

export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  return (data?.plan as PlanType) || 'free'
}

export async function getUserUsage(userId: string): Promise<UsageStats> {
  const supabase = await createClient()

  // Get current month start
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Count posts this month
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart)

  // Count AI generations this month (from user_activity_logs)
  const { count: aiCount } = await supabase
    .from('user_activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('activity_type', 'post_created')
    .gte('created_at', monthStart)

  // Count LinkedIn accounts
  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_connected')
    .eq('id', userId)
    .single()

  // Count scheduled posts
  const { count: scheduledCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'scheduled')

  return {
    postsThisMonth: postsCount || 0,
    aiGenerationsThisMonth: aiCount || 0,
    linkedinAccountsConnected: profile?.linkedin_connected ? 1 : 0,
    scheduledPostsCount: scheduledCount || 0,
  }
}

export async function checkLimit(
  userId: string,
  limitType: keyof UsageStats
): Promise<{ allowed: boolean; limit: number; current: number; remaining: number }> {
  const plan = await getUserPlan(userId)
  const usage = await getUserUsage(userId)
  const limits = PLAN_LIMITS[plan]

  let limit: number
  let current: number

  switch (limitType) {
    case 'postsThisMonth':
      limit = limits.postsPerMonth
      current = usage.postsThisMonth
      break
    case 'aiGenerationsThisMonth':
      limit = limits.aiGenerations
      current = usage.aiGenerationsThisMonth
      break
    case 'linkedinAccountsConnected':
      limit = limits.linkedinAccounts
      current = usage.linkedinAccountsConnected
      break
    case 'scheduledPostsCount':
      limit = limits.scheduledPosts
      current = usage.scheduledPostsCount
      break
    default:
      limit = 0
      current = 0
  }

  return {
    allowed: current < limit,
    limit,
    current,
    remaining: Math.max(0, limit - current),
  }
}

export async function canCreatePost(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const result = await checkLimit(userId, 'postsThisMonth')

  if (!result.allowed) {
    const plan = await getUserPlan(userId)
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${result.limit} posts on the ${plan} plan. Upgrade to create more posts.`,
    }
  }

  return { allowed: true }
}

export async function canGenerateAI(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  // Get subscription limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, ai_generations_limit, ai_generations_used')
    .eq('user_id', userId)
    .single()

  if (!subscription) {
    return {
      allowed: false,
      reason: 'Subscription not found. Please contact support.',
    }
  }

  const limit = subscription.ai_generations_limit || 5
  const used = subscription.ai_generations_used || 0
  const remaining = limit - used

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} AI generations on the ${subscription.plan} plan. Upgrade for more.`,
    }
  }

  return { allowed: true }
}

export async function canSchedulePost(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const result = await checkLimit(userId, 'scheduledPostsCount')

  if (!result.allowed) {
    const plan = await getUserPlan(userId)
    return {
      allowed: false,
      reason: `You've reached your limit of ${result.limit} scheduled posts on the ${plan} plan. Publish or delete some posts first.`,
    }
  }

  return { allowed: true }
}
