/**
 * A/B Testing Library
 * Core functionality for creating and analyzing A/B tests
 */

export interface ABTestVariant {
  id?: string
  variant_name: string
  variant_label?: string
  traffic_percentage: number
  content: string
  hashtags?: string[]
  topic?: string
  media_urls?: string[]
}

export interface ABTestConfig {
  name: string
  description?: string
  test_type: 'content' | 'hashtags' | 'cta' | 'mixed'
  variants: ABTestVariant[]
  duration_hours?: number
  min_sample_size?: number
  confidence_level?: number
  auto_promote_winner?: boolean
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

/**
 * Validate A/B test configuration
 */
export function validateABTestConfig(config: ABTestConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate variant count
  if (config.variants.length < 2) {
    errors.push('At least 2 variants are required')
  }

  if (config.variants.length > 5) {
    errors.push('Maximum 5 variants allowed')
  }

  // Validate traffic percentages
  const totalPercentage = config.variants.reduce((sum, v) => sum + v.traffic_percentage, 0)
  if (totalPercentage !== 100) {
    errors.push(`Traffic percentages must sum to 100% (current: ${totalPercentage}%)`)
  }

  // Validate each variant has unique name
  const variantNames = config.variants.map(v => v.variant_name)
  const uniqueNames = new Set(variantNames)
  if (variantNames.length !== uniqueNames.size) {
    errors.push('All variant names must be unique')
  }

  // Validate content exists
  config.variants.forEach((variant, index) => {
    if (!variant.content || variant.content.trim().length === 0) {
      errors.push(`Variant ${index + 1} (${variant.variant_name}) must have content`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(
  views: number,
  likes: number,
  comments: number,
  shares: number
): number {
  if (views === 0) return 0
  const totalEngagements = likes + comments + shares
  return (totalEngagements / views) * 100
}

/**
 * Calculate conversion rate (clicks / views)
 */
export function calculateConversionRate(clicks: number, views: number): number {
  if (views === 0) return 0
  return (clicks / views) * 100
}

/**
 * Perform Chi-Square test for statistical significance
 * Tests if the difference between variants is statistically significant
 */
export function chiSquareTest(
  variant1: { successes: number; trials: number },
  variant2: { successes: number; trials: number }
): { isSignificant: boolean; pValue: number; chiSquare: number } {
  const { successes: s1, trials: n1 } = variant1
  const { successes: s2, trials: n2 } = variant2

  const f1 = s1 // failures in variant 1
  const f2 = s2 // failures in variant 2

  const totalSuccesses = s1 + s2
  const totalFailures = n1 + n2
  const totalTrials = n1 + n2

  if (totalTrials === 0) {
    return { isSignificant: false, pValue: 1, chiSquare: 0 }
  }

  // Expected values
  const e11 = (n1 * totalSuccesses) / totalTrials
  const e12 = (n1 * totalFailures) / totalTrials
  const e21 = (n2 * totalSuccesses) / totalTrials
  const e22 = (n2 * totalFailures) / totalTrials

  // Chi-square statistic
  const chiSquare =
    Math.pow(s1 - e11, 2) / e11 +
    Math.pow(f1 - e12, 2) / e12 +
    Math.pow(s2 - e21, 2) / e21 +
    Math.pow(f2 - e22, 2) / e22

  // For 1 degree of freedom, critical value at 95% confidence is 3.841
  const criticalValue = 3.841
  const isSignificant = chiSquare > criticalValue

  // Approximate p-value calculation (simplified)
  const pValue = isSignificant ? 0.05 : 0.5

  return {
    isSignificant,
    pValue,
    chiSquare,
  }
}

/**
 * Determine the winning variant based on engagement metrics
 */
export function determineWinner(
  results: ABTestResults[],
  minSampleSize: number = 100,
  confidenceLevel: number = 0.95
): {
  winner: ABTestResults | null
  isSignificant: boolean
  confidence: number
  reason: string
} {
  // Check if we have enough data
  const hasEnoughData = results.every(r => r.views >= minSampleSize)

  if (!hasEnoughData) {
    return {
      winner: null,
      isSignificant: false,
      confidence: 0,
      reason: `Not enough data. Need at least ${minSampleSize} views per variant.`,
    }
  }

  // Sort by engagement rate
  const sortedResults = [...results].sort((a, b) => b.engagement_rate - a.engagement_rate)
  const topVariant = sortedResults[0]
  const secondVariant = sortedResults[1]

  if (!secondVariant) {
    return {
      winner: topVariant,
      isSignificant: true,
      confidence: 1,
      reason: 'Only one variant with data',
    }
  }

  // Perform chi-square test between top two variants
  const test = chiSquareTest(
    {
      successes: topVariant.likes + topVariant.comments + topVariant.shares,
      trials: topVariant.views,
    },
    {
      successes: secondVariant.likes + secondVariant.comments + secondVariant.shares,
      trials: secondVariant.views,
    }
  )

  const confidence = test.isSignificant ? confidenceLevel : 0.5

  return {
    winner: test.isSignificant ? topVariant : null,
    isSignificant: test.isSignificant,
    confidence,
    reason: test.isSignificant
      ? `Variant ${topVariant.variant_name} is statistically significant winner (${(confidence * 100).toFixed(0)}% confidence)`
      : 'No statistically significant difference between variants yet',
  }
}

/**
 * Calculate relative improvement of a variant compared to baseline
 */
export function calculateImprovement(
  variantMetric: number,
  baselineMetric: number
): { improvement: number; percentage: string } {
  if (baselineMetric === 0) {
    return { improvement: 0, percentage: '0%' }
  }

  const improvement = ((variantMetric - baselineMetric) / baselineMetric) * 100

  return {
    improvement,
    percentage: improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`,
  }
}

/**
 * Suggest optimal traffic split based on variant count
 */
export function suggestTrafficSplit(variantCount: number): number[] {
  if (variantCount === 2) return [50, 50]
  if (variantCount === 3) return [34, 33, 33]
  if (variantCount === 4) return [25, 25, 25, 25]
  if (variantCount === 5) return [20, 20, 20, 20, 20]
  return []
}

/**
 * Check if minimum sample size is reached
 */
export function hasMinimumSampleSize(
  results: ABTestResults[],
  minSampleSize: number = 100
): boolean {
  return results.every(r => r.views >= minSampleSize)
}

/**
 * Calculate confidence interval for engagement rate
 */
export function calculateConfidenceInterval(
  engagements: number,
  views: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  if (views === 0) {
    return { lower: 0, upper: 0 }
  }

  const proportion = engagements / views
  const z = confidenceLevel === 0.95 ? 1.96 : 2.58 // 95% or 99%

  const standardError = Math.sqrt((proportion * (1 - proportion)) / views)
  const margin = z * standardError

  return {
    lower: Math.max(0, (proportion - margin) * 100),
    upper: Math.min(100, (proportion + margin) * 100),
  }
}

/**
 * Get variant color for charts
 */
export function getVariantColor(index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
  ]
  return colors[index % colors.length]
}

/**
 * Format metric for display
 */
export function formatMetric(value: number, type: 'number' | 'percentage' | 'rate'): string {
  if (type === 'number') {
    return value.toLocaleString()
  }
  if (type === 'percentage' || type === 'rate') {
    return `${value.toFixed(2)}%`
  }
  return value.toString()
}
