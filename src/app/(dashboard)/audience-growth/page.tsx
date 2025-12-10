'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Users, TrendingUp, TrendingDown, Calendar, ArrowUp, ArrowDown } from 'lucide-react'

export default function AudienceGrowthPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch real growth data from API
        try {
          const response = await fetch('/api/analytics/growth')
          if (response.ok) {
            const data = await response.json()
            setStats(data.stats || {
              totalFollowers: 0,
              weeklyGrowth: 0,
              growthRate: 0,
              avgEngagement: 0,
            })
            setWeeklyData(data.weeklyData || [])
            setInsights(data.insights || [])
          }
        } catch (error) {
          console.error('Error loading growth data:', error)
          // Set empty state if API fails
          setStats({
            totalFollowers: 0,
            weeklyGrowth: 0,
            growthRate: 0,
            avgEngagement: 0,
          })
          setWeeklyData([])
          setInsights([])
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audience Growth</h1>
              <p className="text-gray-600">Track your LinkedIn audience growth and engagement</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Followers</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.totalFollowers?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>{stats?.weeklyGrowth || 0} this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.growthRate || 0}%
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+1.2% from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Weekly Growth</span>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              +{stats?.weeklyGrowth || 0}
            </div>
            <div className="text-sm text-gray-600">Last 7 days</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Engagement</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.avgEngagement || 0}%
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+0.5% this week</span>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">7-Day Growth Trend</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-sm text-gray-600">Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-100"></div>
                <span className="text-sm text-gray-600">Baseline</span>
              </div>
            </div>
          </div>
          {weeklyData.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-4">
              {weeklyData.map((data, index) => {
                const minFollowers = Math.min(...weeklyData.map(d => d.followers))
                const maxFollowers = Math.max(...weeklyData.map(d => d.followers))
                const range = maxFollowers - minFollowers || 1
                const height = ((data.followers - minFollowers) / range) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg absolute bottom-0 transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-600">{data.day}</div>
                    <div className="text-xs text-gray-500">{data.followers?.toLocaleString() || 0}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No growth data available yet</p>
                <p className="text-sm">Connect your LinkedIn account to start tracking</p>
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className={`w-12 h-12 ${insight.bg} rounded-xl flex items-center justify-center mb-4`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <h3 className="text-sm text-gray-600 mb-2">{insight.title}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
              <div className={`text-sm ${insight.color}`}>{insight.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
