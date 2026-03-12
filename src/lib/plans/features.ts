/**
 * Plan-based feature access configuration
 */

export type Plan = 'free' | 'pro' | 'standard'

export interface PlanFeatures {
  // Limits
  linkedinAccounts: number
  postsPerMonth: number
  aiCredits: number
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    linkedinAccounts: 1,
    postsPerMonth: 5,
    aiCredits: 50,
  },
  pro: {
    linkedinAccounts: 5,
    postsPerMonth: 100,
    aiCredits: 500,
  },
  standard: {
    linkedinAccounts: 10,
    postsPerMonth: 500,
    aiCredits: 2000,
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
