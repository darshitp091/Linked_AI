'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Sparkles, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface TimeSlot {
  day: string
  hour: number
  score: number
  avgEngagement: number
  postCount: number
}

interface BestTimeData {
  recommendedSlots: TimeSlot[]
  insights: string
  confidence: number
  analysisDate: string
}

interface BestTimeWidgetProps {
  userPlan: string
  onUpgrade?: () => void
}

export default function BestTimeWidget({ userPlan, onUpgrade }: BestTimeWidgetProps) {
  const [data, setData] = useState<BestTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const plans = ['pro', 'standard', 'custom']
    setHasAccess(plans.includes(userPlan.toLowerCase()))

    if (hasAccess) {
      fetchBestTime()
    } else {
      setLoading(false)
    }
  }, [userPlan])

  const fetchBestTime = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/best-time')

      if (response.status === 403) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const result = await response.json()
      setData(result)
    } catch (error: any) {
      console.error('Error fetching best time:', error)
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-gray-100'
  }

  if (!hasAccess) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered Best Time to Post
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Unlock personalized insights about when your audience is most engaged. Our AI analyzes your posting history to recommend the optimal times to publish for maximum engagement.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-200">
                Historical pattern analysis
              </span>
              <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-200">
                AI-generated insights
              </span>
              <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-200">
                Next best time suggestions
              </span>
            </div>
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Best Time to Post</h3>
            <p className="text-sm text-gray-500">
              Based on {data.confidence}% confidence
            </p>
          </div>
        </div>
        <Button
          onClick={fetchBestTime}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Refresh
        </Button>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-100">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">AI Insights</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {data.insights}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Time Slots */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          Top 5 Recommended Times
        </h4>

        {data.recommendedSlots.map((slot, index) => (
          <div
            key={`${slot.day}-${slot.hour}`}
            className={`${getScoreBg(slot.score)} rounded-lg p-4 border border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-sm font-bold text-gray-700">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {slot.day}
                    </span>
                    <span className="text-gray-600">at</span>
                    <span className="font-medium text-gray-900">
                      {formatHour(slot.hour)}
                    </span>
                  </div>
                  {slot.postCount > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Based on {slot.postCount} post{slot.postCount > 1 ? 's' : ''} •
                      Avg engagement: {slot.avgEngagement}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(slot.score)}`}>
                  {slot.score}
                </div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date(data.analysisDate).toLocaleDateString()} •
          Recommendations improve as you publish more posts
        </p>
      </div>
    </div>
  )
}
