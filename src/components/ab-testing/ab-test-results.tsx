'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  calculateImprovement,
  getVariantColor,
  formatMetric,
  calculateConfidenceInterval,
} from '@/lib/ab-testing'

interface ABTestResultsProps {
  test: any
  analytics: any[]
  winnerAnalysis: any
  onSelectWinner?: (variantId: string) => void
  onRefresh?: () => void
}

export default function ABTestResults({
  test,
  analytics,
  winnerAnalysis,
  onSelectWinner,
  onRefresh,
}: ABTestResultsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'engagement_rate' | 'views' | 'likes'>('engagement_rate')

  // Sort variants by selected metric
  const sortedVariants = [...(test.variants || [])].sort((a, b) => {
    const aValue = a[selectedMetric] || 0
    const bValue = b[selectedMetric] || 0
    return bValue - aValue
  })

  const baselineVariant = sortedVariants[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{test.name}</h2>
          <p className="text-gray-600 mt-1">{test.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            test.status === 'active' ? 'bg-green-100 text-green-800' :
            test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh Data
            </Button>
          )}
        </div>
      </div>

      {/* Winner Analysis */}
      {winnerAnalysis && (
        <div className={`p-4 rounded-lg ${
          winnerAnalysis.isSignificant
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {winnerAnalysis.isSignificant ? '🏆 Winner Detected!' : '📊 Test in Progress'}
              </h3>
              <p className="text-sm mt-1">{winnerAnalysis.reason}</p>
              {winnerAnalysis.winner && (
                <p className="text-sm font-medium mt-2">
                  Leading Variant: <span className="text-blue-600">{winnerAnalysis.winner.variant_name}</span>
                  {' '}with {formatMetric(winnerAnalysis.winner.engagement_rate, 'rate')} engagement rate
                </p>
              )}
            </div>
            {winnerAnalysis.isSignificant && onSelectWinner && winnerAnalysis.winner && (
              <Button
                onClick={() => onSelectWinner(winnerAnalysis.winner.variant_id)}
                size="sm"
              >
                Select Winner
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Metric Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Compare by:</span>
        <div className="flex space-x-2">
          {[
            { value: 'engagement_rate', label: 'Engagement Rate' },
            { value: 'views', label: 'Views' },
            { value: 'likes', label: 'Likes' },
          ].map((metric) => (
            <button
              key={metric.value}
              onClick={() => setSelectedMetric(metric.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Variant Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVariants.map((variant: any, index: number) => {
          const improvement = baselineVariant
            ? calculateImprovement(
                variant[selectedMetric] || 0,
                baselineVariant[selectedMetric] || 0
              )
            : { improvement: 0, percentage: '0%' }

          const totalEngagements = (variant.likes || 0) + (variant.comments || 0) + (variant.shares || 0)
          const confidenceInterval = calculateConfidenceInterval(
            totalEngagements,
            variant.views || 0
          )

          const isLeader = index === 0

          return (
            <div
              key={variant.id}
              className={`border-2 rounded-lg p-4 ${
                isLeader ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } ${variant.is_winner ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: getVariantColor(index) }}
                  >
                    {variant.variant_name}
                  </div>
                  <div>
                    <h4 className="font-semibold">{variant.variant_label}</h4>
                    <p className="text-xs text-gray-500">{variant.traffic_percentage}% traffic</p>
                  </div>
                </div>
                {variant.is_winner && (
                  <span className="text-2xl">🏆</span>
                )}
                {isLeader && !variant.is_winner && (
                  <span className="text-xl">⭐</span>
                )}
              </div>

              {/* Main Metric */}
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {formatMetric(variant[selectedMetric] || 0,
                    selectedMetric === 'engagement_rate' ? 'rate' : 'number'
                  )}
                </div>
                {index > 0 && (
                  <div className={`text-sm font-medium mt-1 ${
                    improvement.improvement > 0 ? 'text-green-600' :
                    improvement.improvement < 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {improvement.percentage} vs Variant A
                  </div>
                )}
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Views</div>
                  <div className="font-semibold">{formatMetric(variant.views || 0, 'number')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Engagement</div>
                  <div className="font-semibold">{formatMetric(variant.engagement_rate || 0, 'rate')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Likes</div>
                  <div className="font-semibold">{formatMetric(variant.likes || 0, 'number')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Comments</div>
                  <div className="font-semibold">{formatMetric(variant.comments || 0, 'number')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Shares</div>
                  <div className="font-semibold">{formatMetric(variant.shares || 0, 'number')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Clicks</div>
                  <div className="font-semibold">{formatMetric(variant.clicks || 0, 'number')}</div>
                </div>
              </div>

              {/* Confidence Interval */}
              {variant.views > 0 && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  95% CI: {confidenceInterval.lower.toFixed(2)}% - {confidenceInterval.upper.toFixed(2)}%
                </div>
              )}

              {/* Statistical Significance */}
              {variant.statistical_significance && (
                <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded text-center">
                  Statistically Significant
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {analytics && analytics.length > 0 ? (
            <div className="w-full">
              <PerformanceChart analytics={analytics} variants={test.variants} />
            </div>
          ) : (
            <p>No analytics data available yet. Data will appear as the test runs.</p>
          )}
        </div>
      </div>

      {/* Sample Size Progress */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Sample Size Progress</h3>
        <div className="space-y-3">
          {test.variants?.map((variant: any, index: number) => {
            const progress = Math.min(
              ((variant.views || 0) / test.min_sample_size) * 100,
              100
            )
            const isComplete = (variant.views || 0) >= test.min_sample_size

            return (
              <div key={variant.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">
                    Variant {variant.variant_name}: {variant.variant_label}
                  </span>
                  <span className={isComplete ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                    {variant.views || 0} / {test.min_sample_size} views
                    {isComplete && ' ✓'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Preview */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Variant Content</h3>
        <div className="space-y-4">
          {test.variants?.map((variant: any, index: number) => (
            <div key={variant.id} className="border-l-4 pl-4" style={{ borderColor: getVariantColor(index) }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  Variant {variant.variant_name}: {variant.variant_label}
                </h4>
                {variant.post?.linkedin_post_url && (
                  <a
                    href={variant.post.linkedin_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View on LinkedIn →
                  </a>
                )}
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {variant.post?.content}
              </div>
              {variant.post?.hashtags && variant.post.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {variant.post.hashtags.map((tag: string, i: number) => (
                    <span key={i} className="text-xs text-blue-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simple chart component (you could replace with a charting library like recharts)
function PerformanceChart({ analytics, variants }: { analytics: any[]; variants: any[] }) {
  // Group analytics by variant
  const variantData = variants.map((variant) => {
    const variantAnalytics = analytics.filter(a => a.variant_id === variant.id)
    return {
      variant,
      data: variantAnalytics,
    }
  })

  return (
    <div className="text-center text-gray-500">
      Chart visualization would go here
      <br />
      <span className="text-xs">
        (Integrate with recharts or similar library for full chart functionality)
      </span>
    </div>
  )
}
