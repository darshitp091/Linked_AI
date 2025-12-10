// PostHog Analytics Client
// Tracks user behavior and product analytics

import posthog from 'posthog-js'

// Initialize PostHog (call this once on app load)
export const initPostHog = () => {
  if (typeof window === 'undefined') return

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey || apiKey === 'your_posthog_key_here') {
    console.warn('PostHog API key not configured')
    return
  }

  posthog.init(apiKey, {
    api_host: apiHost || 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // Only create profiles for logged-in users
    capture_pageview: true, // Automatically capture page views
    capture_pageleave: true, // Track when users leave pages
    autocapture: true, // Automatically capture clicks and interactions
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PostHog initialized')
      }
    },
  })
}

// Identify user (call after login)
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window === 'undefined') return
  posthog.identify(userId, traits)
}

// Reset user identity (call on logout)
export const resetUser = () => {
  if (typeof window === 'undefined') return
  posthog.reset()
}

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return
  posthog.capture(eventName, properties)
}

// LinkedIn AI Scheduler - Event Tracking Functions

// User Authentication Events
export const trackSignUp = (method: 'email' | 'linkedin' | 'google') => {
  trackEvent('user_signed_up', { method })
}

export const trackLogin = (method: 'email' | 'linkedin' | 'google') => {
  trackEvent('user_logged_in', { method })
}

export const trackLogout = () => {
  trackEvent('user_logged_out')
  resetUser()
}

// Post Generation Events
export const trackPostGenerated = (data: {
  topics: string[]
  style: string
  tone: string
  length: number
  postsCount: number
  postsRemaining: number
}) => {
  trackEvent('post_generated', {
    topics_count: data.topics.length,
    topics: data.topics.join(', '),
    style: data.style,
    tone: data.tone,
    length: data.length,
    posts_generated: data.postsCount,
    posts_remaining: data.postsRemaining,
  })
}

export const trackPostEdited = (postId: string) => {
  trackEvent('post_edited', { post_id: postId })
}

export const trackPostSavedAsDraft = (data: {
  postId?: string
  topic?: string
  contentLength: number
}) => {
  trackEvent('post_saved_as_draft', {
    post_id: data.postId,
    topic: data.topic,
    content_length: data.contentLength,
  })
}

// Scheduling & Publishing Events
export const trackPostScheduled = (data: {
  postId: string
  scheduledFor: string
  scheduledIn: string // e.g., "2 hours", "1 day"
}) => {
  trackEvent('post_scheduled', {
    post_id: data.postId,
    scheduled_for: data.scheduledFor,
    scheduled_in: data.scheduledIn,
  })
}

export const trackPostPublished = (data: {
  postId: string
  method: 'manual' | 'scheduled' | 'auto'
  linkedInPostId?: string
}) => {
  trackEvent('post_published', {
    post_id: data.postId,
    method: data.method,
    linkedin_post_id: data.linkedInPostId,
  })
}

export const trackPostDeleted = (postId: string, status: 'draft' | 'scheduled' | 'published') => {
  trackEvent('post_deleted', { post_id: postId, status })
}

// LinkedIn Connection Events
export const trackLinkedInConnected = () => {
  trackEvent('linkedin_connected')
}

export const trackLinkedInDisconnected = () => {
  trackEvent('linkedin_disconnected')
}

// Template Events
export const trackTemplateUsed = (data: {
  templateId: string
  templateName: string
  templateCategory: string
}) => {
  trackEvent('template_used', {
    template_id: data.templateId,
    template_name: data.templateName,
    template_category: data.templateCategory,
  })
}

export const trackTemplateCreated = (templateName: string) => {
  trackEvent('template_created', { template_name: templateName })
}

// Subscription & Billing Events
export const trackSubscriptionUpgraded = (data: {
  fromPlan: string
  toPlan: string
  billingCycle: 'monthly' | 'yearly'
  amount: number
}) => {
  trackEvent('subscription_upgraded', {
    from_plan: data.fromPlan,
    to_plan: data.toPlan,
    billing_cycle: data.billingCycle,
    amount: data.amount,
  })
}

export const trackSubscriptionCancelled = (plan: string) => {
  trackEvent('subscription_cancelled', { plan })
}

export const trackPaymentSuccess = (data: {
  plan: string
  amount: number
  currency: string
  paymentMethod: string
}) => {
  trackEvent('payment_success', {
    plan: data.plan,
    amount: data.amount,
    currency: data.currency,
    payment_method: data.paymentMethod,
  })
}

export const trackPaymentFailed = (data: {
  plan: string
  amount: number
  reason: string
}) => {
  trackEvent('payment_failed', {
    plan: data.plan,
    amount: data.amount,
    reason: data.reason,
  })
}

// Feature Usage Events
export const trackFeatureUsed = (featureName: string, metadata?: Record<string, any>) => {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...metadata,
  })
}

export const trackAIAssistUsed = (data: {
  action: 'improve' | 'shorten' | 'hashtags' | 'rewrite'
  originalLength: number
  newLength: number
}) => {
  trackEvent('ai_assist_used', {
    action: data.action,
    original_length: data.originalLength,
    new_length: data.newLength,
  })
}

export const trackCalendarIntegration = (action: 'connected' | 'disconnected' | 'synced') => {
  trackEvent('calendar_integration', { action })
}

// Engagement Events
export const trackDashboardViewed = () => {
  trackEvent('dashboard_viewed')
}

export const trackAnalyticsViewed = (period: 'day' | 'week' | 'month' | 'year') => {
  trackEvent('analytics_viewed', { period })
}

export const trackSettingsChanged = (setting: string, value: any) => {
  trackEvent('settings_changed', { setting, value })
}

// Error Tracking
export const trackError = (data: {
  errorType: string
  errorMessage: string
  component?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}) => {
  trackEvent('error_occurred', {
    error_type: data.errorType,
    error_message: data.errorMessage,
    component: data.component,
    severity: data.severity,
  })
}

// Onboarding Events
export const trackOnboardingStarted = () => {
  trackEvent('onboarding_started')
}

export const trackOnboardingCompleted = (duration: number) => {
  trackEvent('onboarding_completed', { duration_seconds: duration })
}

export const trackOnboardingSkipped = (step: number) => {
  trackEvent('onboarding_skipped', { step })
}

// Export PostHog instance for advanced usage
export { posthog }
