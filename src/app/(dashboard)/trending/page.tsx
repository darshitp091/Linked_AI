'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, TrendingUp, Hash, Clock, Eye, MessageCircle, Heart, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TrendingTopicsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [topHashtags, setTopHashtags] = useState<any[]>([])
  const supabase = createClient()

  const loadTrendingData = async () => {
    try {
      const response = await fetch('/api/trending-topics')
      if (response.ok) {
        const data = await response.json()
        setTrendingTopics(data.topics || [])
        setTopHashtags(data.hashtags || [])
      }
    } catch (error) {
      console.error('Error loading trending data:', error)
      setTrendingTopics([])
      setTopHashtags([])
    }
  }

  useEffect(() => {
    const initData = async () => {
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
      }

      await loadTrendingData()
      setLoading(false)
    }

    initData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTrendingData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Trending Topics</h1>
                <p className="text-gray-600">Discover what's trending on LinkedIn right now</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Topics */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Trending Topics
            </h2>
            {trendingTopics.map((topic, index) => (
              <div
                key={topic.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-lg">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {topic.topic}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Hash className="w-4 h-4" />
                        <span className="font-medium">{topic.hashtag}</span>
                        <span className="text-gray-400">•</span>
                        <span>{topic.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    +{topic.growth}%
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{topic.mentions?.toLocaleString() || 0} mentions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last {topic.timeframe || '24h'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Hashtags */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Top Hashtags
              </h3>
              <div className="space-y-3">
                {topHashtags.length > 0 ? topHashtags.map((hashtag, index) => (
                  <div key={hashtag.tag || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-400 w-4">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{hashtag.tag}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {((hashtag.posts || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hashtags available</p>
                )}
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4">Engagement Insights</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Likes</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">2.3M</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>Comments</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">456K</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>Shares</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">189K</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
