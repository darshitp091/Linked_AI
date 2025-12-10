'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ABTestListProps {
  tests: any[]
  onDelete?: (testId: string) => void
}

export default function ABTestList({ tests, onDelete }: ABTestListProps) {
  if (!tests || tests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🧪</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No A/B Tests Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first A/B test to optimize your LinkedIn content performance
        </p>
        <Link
          href="/dashboard/ab-tests/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create A/B Test
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tests.map((test) => {
        const totalViews = test.variants?.reduce((sum: number, v: any) => sum + (v.views || 0), 0) || 0
        const totalEngagement = test.variants?.reduce(
          (sum: number, v: any) => sum + (v.likes || 0) + (v.comments || 0) + (v.shares || 0),
          0
        ) || 0
        const avgEngagementRate = totalViews > 0
          ? ((totalEngagement / totalViews) * 100).toFixed(2)
          : '0.00'

        const leadingVariant = test.variants?.sort(
          (a: any, b: any) => (b.engagement_rate || 0) - (a.engagement_rate || 0)
        )[0]

        return (
          <div
            key={test.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Link
                    href={`/dashboard/ab-tests/${test.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {test.name}
                  </Link>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : test.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : test.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {test.status}
                  </span>
                  {test.winner_variant_id && (
                    <span className="text-xl" title="Winner selected">
                      🏆
                    </span>
                  )}
                </div>

                {test.description && (
                  <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">{test.variants?.length || 0}</span> variants
                  </div>
                  <div>
                    <span className="font-medium">{totalViews}</span> total views
                  </div>
                  <div>
                    <span className="font-medium">{avgEngagementRate}%</span> avg engagement
                  </div>
                  {leadingVariant && (
                    <div>
                      Leading: <span className="font-medium">Variant {leadingVariant.variant_name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <div>
                    Created {formatDistanceToNow(new Date(test.created_at), { addSuffix: true })}
                  </div>
                  {test.started_at && (
                    <div>
                      Started {formatDistanceToNow(new Date(test.started_at), { addSuffix: true })}
                    </div>
                  )}
                  {test.ended_at && (
                    <div>
                      Ended {formatDistanceToNow(new Date(test.ended_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Link
                  href={`/dashboard/ab-tests/${test.id}`}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  View Results
                </Link>
                {onDelete && test.status === 'draft' && (
                  <button
                    onClick={() => onDelete(test.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Variant Performance Bar */}
            {test.variants && test.variants.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-500 mr-2">Performance:</div>
                  <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-gray-100">
                    {test.variants
                      .sort((a: any, b: any) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
                      .map((variant: any, index: number) => {
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500']
                        const percentage = totalViews > 0 ? ((variant.views || 0) / totalViews) * 100 : 0

                        return (
                          <div
                            key={variant.id}
                            className={`${colors[index]} h-full`}
                            style={{ width: `${percentage}%` }}
                            title={`Variant ${variant.variant_name}: ${variant.engagement_rate || 0}% engagement`}
                          />
                        )
                      })}
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  {test.variants.map((variant: any, index: number) => {
                    const colors = ['text-blue-500', 'text-green-500', 'text-amber-500', 'text-red-500', 'text-purple-500']
                    return (
                      <div key={variant.id} className="flex items-center space-x-1 text-xs">
                        <div className={`w-3 h-3 rounded-full ${colors[index].replace('text', 'bg')}`} />
                        <span className="text-gray-600">
                          Variant {variant.variant_name}: {variant.engagement_rate?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
