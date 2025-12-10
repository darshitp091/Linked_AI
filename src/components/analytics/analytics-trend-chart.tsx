'use client'

import { useEffect, useState } from 'react'
import { Loader2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface TrendDataPoint {
  date: string
  views: number
  likes: number
  comments: number
  shares: number
  posts: number
}

export default function AnalyticsTrendChart() {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'comments' | 'shares'>('views')

  useEffect(() => {
    fetchTrendData()
  }, [selectedPeriod])

  const fetchTrendData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/trend?days=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setTrendData(data.data || [])
      } else {
        throw new Error('Failed to fetch trend data')
      }
    } catch (error) {
      console.error('Error fetching trend data:', error)
      toast.error('Failed to load trend data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading trend data...</p>
      </div>
    )
  }

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trend Data</h3>
        <p className="text-gray-600">
          Not enough posts in the selected period to show trends
        </p>
      </div>
    )
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...trendData.map((d) => d[selectedMetric]))
  const minValue = Math.min(...trendData.map((d) => d[selectedMetric]))

  // Metric configuration
  const metrics = {
    views: { label: 'Views', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-100' },
    likes: { label: 'Likes', color: 'from-red-500 to-pink-600', bgColor: 'bg-red-100' },
    comments: { label: 'Comments', color: 'from-green-500 to-green-600', bgColor: 'bg-green-100' },
    shares: { label: 'Shares', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-100' },
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
            <p className="text-sm text-gray-600">Track your metrics over time</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[7, 14, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedPeriod(days)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === days
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(Object.keys(metrics) as Array<keyof typeof metrics>).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    selectedMetric === metric
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {metrics[metric].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>{maxValue}</span>
            <span>{Math.round((maxValue + minValue) / 2)}</span>
            <span>{minValue}</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full flex items-end gap-1">
            {trendData.map((point, index) => {
              const value = point[selectedMetric]
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0

              return (
                <div key={point.date} className="flex-1 flex flex-col items-center group">
                  {/* Bar */}
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                    <div
                      className={`w-full rounded-t-lg bg-gradient-to-t ${metrics[selectedMetric].color} transition-all hover:opacity-80 cursor-pointer`}
                      style={{ height: `${height}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                          <div className="font-semibold mb-1">
                            {new Date(point.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="space-y-0.5">
                            <div>{metrics[selectedMetric].label}: {value}</div>
                            <div className="text-gray-400">Posts: {point.posts}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X-axis label - show every few labels to avoid crowding */}
                  {(index % Math.ceil(trendData.length / 8) === 0 || index === trendData.length - 1) && (
                    <div className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                      {new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {trendData.reduce((sum, d) => sum + d.views, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {trendData.reduce((sum, d) => sum + d.likes, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {trendData.reduce((sum, d) => sum + d.comments, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {trendData.reduce((sum, d) => sum + d.shares, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total Shares</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
