/**
 * Plan-based feature access configuration
 */

export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'

export interface PlanFeatures {
  // Limits
  linkedinAccounts: number
  postsPerMonth: number
  aiCredits: number
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    linkedinAccounts: 1,
    postsPerMonth: 10,
    aiCredits: 50,
  },
  starter: {
    linkedinAccounts: 3,
    postsPerMonth: 50,
    aiCredits: 200,
  },
  pro: {
    linkedinAccounts: 10,
    postsPerMonth: 200,
    aiCredits: 1000,
  },
  enterprise: {
    linkedinAccounts: -1, // unlimited
    postsPerMonth: -1, // unlimited
    aiCredits: -1, // unlimited
  },
}

export function hasFeatureAccess(plan: Plan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan]?.[feature] !== undefined
}

export function getFeatureLimit(plan: Plan, feature: keyof PlanFeatures): number {
  const value = PLAN_FEATURES[plan]?.[feature]
  return typeof value === 'number' ? value : 0
}

export function canAccessRoute(plan: Plan, route: string): boolean {
  const freeRoutes = [
    '/dashboard',
    '/generate',
    '/templates',
    '/drafts',
    '/calendar',
    '/scheduled',
    '/notifications',
    '/settings',
    '/support',
  ]

  return freeRoutes.some(r => route === r || route.startsWith(r + '/'))
}
