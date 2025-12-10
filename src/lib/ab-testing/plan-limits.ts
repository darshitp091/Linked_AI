/**
 * Plan-based limits for A/B Testing feature
 */

export type SubscriptionPlan = 'free' | 'pro' | 'standard' | 'custom' | 'starter' | 'enterprise'

export interface ABTestingLimits {
  enabled: boolean
  maxVariants: number
  maxActiveTests: number
  autoPromoteWinner: boolean
  advancedAnalytics: boolean
}

/**
 * Get A/B testing limits based on subscription plan
 */
export function getABTestingLimits(plan: SubscriptionPlan): ABTestingLimits {
  const limits: Record<SubscriptionPlan, ABTestingLimits> = {
    free: {
      enabled: false,
      maxVariants: 0,
      maxActiveTests: 0,
      autoPromoteWinner: false,
      advancedAnalytics: false,
    },
    starter: {
      enabled: false,
      maxVariants: 0,
      maxActiveTests: 0,
      autoPromoteWinner: false,
      advancedAnalytics: false,
    },
    pro: {
      enabled: false,
      maxVariants: 0,
      maxActiveTests: 0,
      autoPromoteWinner: false,
      advancedAnalytics: false,
    },
    standard: {
      enabled: true,
      maxVariants: 3,
      maxActiveTests: 5,
      autoPromoteWinner: true,
      advancedAnalytics: false,
    },
    custom: {
      enabled: true,
      maxVariants: 5,
      maxActiveTests: 10,
      autoPromoteWinner: true,
      advancedAnalytics: true,
    },
    enterprise: {
      enabled: true,
      maxVariants: 5,
      maxActiveTests: 999,
      autoPromoteWinner: true,
      advancedAnalytics: true,
    },
  }

  return limits[plan] || limits.free
}

/**
 * Check if user can create A/B tests
 */
export function canCreateABTest(plan: SubscriptionPlan): boolean {
  const limits = getABTestingLimits(plan)
  return limits.enabled
}

/**
 * Check if user can create a test with N variants
 */
export function canCreateVariants(plan: SubscriptionPlan, variantCount: number): {
  allowed: boolean
  limit: number
  message?: string
} {
  const limits = getABTestingLimits(plan)

  if (!limits.enabled) {
    return {
      allowed: false,
      limit: 0,
      message: 'A/B Testing is not available on your plan. Upgrade to Standard or Custom plan to access this feature.',
    }
  }

  if (variantCount > limits.maxVariants) {
    return {
      allowed: false,
      limit: limits.maxVariants,
      message: `Your plan supports up to ${limits.maxVariants} variants. Upgrade to ${plan === 'standard' ? 'Custom' : 'Enterprise'} plan for more variants.`,
    }
  }

  return {
    allowed: true,
    limit: limits.maxVariants,
  }
}

/**
 * Check if user can create more active tests
 */
export function canCreateMoreTests(
  plan: SubscriptionPlan,
  currentActiveTests: number
): {
  allowed: boolean
  limit: number
  message?: string
} {
  const limits = getABTestingLimits(plan)

  if (!limits.enabled) {
    return {
      allowed: false,
      limit: 0,
      message: 'A/B Testing is not available on your plan.',
    }
  }

  if (currentActiveTests >= limits.maxActiveTests) {
    return {
      allowed: false,
      limit: limits.maxActiveTests,
      message: `You have reached the limit of ${limits.maxActiveTests} active tests. Complete or cancel existing tests to create new ones.`,
    }
  }

  return {
    allowed: true,
    limit: limits.maxActiveTests,
  }
}

/**
 * Get upgrade CTA message for A/B testing
 */
export function getUpgradeMessage(plan: SubscriptionPlan): string {
  if (plan === 'free' || plan === 'pro' || plan === 'starter') {
    return 'Upgrade to Standard plan to unlock A/B Testing and optimize your LinkedIn content performance.'
  }

  if (plan === 'standard') {
    return 'Upgrade to Custom plan to test up to 5 variants and get advanced analytics.'
  }

  return ''
}
