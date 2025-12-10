/**
 * TypeScript types for A/B Testing System
 */

export type TestType = 'content' | 'hashtags' | 'cta' | 'mixed'
export type TestStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type SubscriptionPlan = 'free' | 'pro' | 'standard' | 'custom' | 'starter' | 'enterprise'

export interface ABTest {
  id: string
  user_id: string
  name: string
  description?: string
  test_type: TestType
  status: TestStatus
  started_at?: string
  ended_at?: string
  duration_hours?: number
  min_sample_size: number
  confidence_level: number
  auto_promote_winner: boolean
  winner_variant_id?: string
  created_at: string
  updated_at: string
}

export interface ABTestVariant {
  id: string
  ab_test_id: string
  post_id: string
  variant_name: string
  variant_label?: string
  traffic_percentage: number
  views: number
  likes: number
  comments: number
  shares: number
  clicks: number
  engagement_rate: number
  conversion_rate: number
  is_winner: boolean
  confidence_score?: number
  statistical_significance: boolean
  created_at: string
  updated_at: string
  post?: {
    id: string
    content: string
    topic?: string
    hashtags?: string[]
    media_urls?: string[]
    status: string
    published_at?: string
    linkedin_post_url?: string
  }
}

export interface ABTestAnalytics {
  id: string
  ab_test_id: string
  variant_id: string
  snapshot_at: string
  views: number
  likes: number
  comments: number
  shares: number
  clicks: number
  engagement_rate: number
  cumulative_views: number
  cumulative_likes: number
  cumulative_comments: number
  cumulative_shares: number
  created_at: string
}

export interface ABTestWithVariants extends ABTest {
  variants: ABTestVariant[]
}

export interface WinnerAnalysis {
  winner: ABTestVariant | null
  isSignificant: boolean
  confidence: number
  reason: string
}

export interface ABTestResults {
  variant_id: string
  variant_name: string
  views: number
  likes: number
  comments: number
  shares: number
  clicks: number
  engagement_rate: number
  conversion_rate: number
  statistical_significance: boolean
  confidence_score: number
}

export interface ABTestConfig {
  name: string
  description?: string
  test_type: TestType
  variants: VariantConfig[]
  duration_hours?: number
  min_sample_size?: number
  confidence_level?: number
  auto_promote_winner?: boolean
}

export interface VariantConfig {
  variant_name: string
  variant_label?: string
  traffic_percentage: number
  content: string
  hashtags?: string[]
  topic?: string
  media_urls?: string[]
}

export interface ABTestingLimits {
  enabled: boolean
  maxVariants: number
  maxActiveTests: number
  autoPromoteWinner: boolean
  advancedAnalytics: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface AccessCheckResult {
  allowed: boolean
  limit: number
  message?: string
}

export interface ImprovementCalculation {
  improvement: number
  percentage: string
}

export interface ConfidenceInterval {
  lower: number
  upper: number
}

export interface ChiSquareResult {
  isSignificant: boolean
  pValue: number
  chiSquare: number
}

export interface TestActionRequest {
  action: 'start' | 'pause' | 'complete' | 'select_winner' | 'sync_metrics'
  winner_variant_id?: string
}

export interface CreateTestRequest {
  name: string
  description?: string
  test_type: TestType
  duration_hours?: number
  min_sample_size?: number
  confidence_level?: number
  auto_promote_winner?: boolean
  variants: VariantConfig[]
}

export interface CreateTestResponse {
  success: boolean
  test: ABTestWithVariants
  error?: string
}

export interface GetTestResponse {
  test: ABTestWithVariants
  analytics: ABTestAnalytics[]
  winnerAnalysis: WinnerAnalysis
}

export interface ListTestsResponse {
  tests: ABTestWithVariants[]
}

export interface UpdateTestResponse {
  success: boolean
  test: ABTestWithVariants
}
