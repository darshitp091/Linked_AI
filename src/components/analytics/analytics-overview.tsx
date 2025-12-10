'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Eye, Heart, MessageCircle, Share2, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnalyticsSummary {
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgEngagementRate: number
  topPost?: {
    id: string
    content: string
    published_at: string
    analytics: {
      views: number
      likes: number
      comments: number
      shares: number
      engagement_rate: number
    }
  }
}

interface AnalyticsOverviewProps {
  onSync?: () => void
}

export default function AnalyticsOverview({ onSync }: AnalyticsOverviewProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/overview')
      if (response.ok) {
        const data = await response.json()
        setSummary(data.data)
      } else {
        throw new Error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Synced ${data.synced} posts successfully`)
        fetchAnalytics()
        onSync?.()
      } else {
        throw new Error('Failed to sync analytics')
      }
    } catch (error) {
      console.error('Error syncing analytics:', error)
      toast.error('Failed to sync analytics')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (!summary || summary.totalPosts === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Yet</h3>
        <p className="text-gray-600 mb-6">
          Publish some posts to start tracking your LinkedIn analytics
        </p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Views',
      value: summary.totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Likes',
      value: summary.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Total Comments',
      value: summary.totalComments.toLocaleString(),
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Shares',
      value: summary.totalShares.toLocaleString(),
      icon: Share2,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600 mt-1">Track your LinkedIn performance</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Analytics'}
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Engagement Rate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Avg. Engagement Rate</h3>
              <p className="text-sm text-gray-600">Based on {summary.totalPosts} posts</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {summary.avgEngagementRate.toFixed(2)}%
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(summary.avgEngagementRate * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Top Performing Post */}
        {summary.topPost && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Post</h3>
                <p className="text-sm text-gray-600">
                  {new Date(summary.topPost.published_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-2">{summary.topPost.content}</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {summary.topPost.analytics.views}
                </div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {summary.topPost.analytics.likes}
                </div>
                <div className="text-xs text-gray-600">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {summary.topPost.analytics.comments}
                </div>
                <div className="text-xs text-gray-600">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {summary.topPost.analytics.shares}
                </div>
                <div className="text-xs text-gray-600">Shares</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
