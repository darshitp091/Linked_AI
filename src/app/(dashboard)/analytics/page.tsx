'use client'

import { BarChart3 } from 'lucide-react'
import AnalyticsOverview from '@/components/analytics/analytics-overview'
import AnalyticsTrendChart from '@/components/analytics/analytics-trend-chart'
import PostPerformanceTable from '@/components/analytics/post-performance-table'
import TopEngagersList from '@/components/analytics/top-engagers-list'
import PlanProtectedRoute from '@/components/auth/PlanProtectedRoute'

export default function AnalyticsPage() {
  return (
    <PlanProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your LinkedIn performance and insights</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Overview Section */}
          <AnalyticsOverview />

          {/* Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnalyticsTrendChart />
            </div>
            <div>
              <TopEngagersList />
            </div>
          </div>

          {/* Post Performance Table */}
          <PostPerformanceTable />
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 About Analytics</h3>
          <ul className="text-sm text-blue-800 space-y-1.5">
            <li>• Analytics are synced from LinkedIn every time you click "Sync Analytics"</li>
            <li>• Data may take a few minutes to appear on LinkedIn after publishing</li>
            <li>• Engagement rate is calculated as (Likes + Comments + Shares) / Views × 100</li>
            <li>• Use the trend chart to identify your best posting times and content types</li>
            <li>• Sort the post table by any metric to find your top-performing content</li>
          </ul>
        </div>
      </div>
    </div>
    </PlanProtectedRoute>
  )
}
