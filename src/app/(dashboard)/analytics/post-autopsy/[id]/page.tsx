'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  ChevronLeft,
  ArrowRight,
  Target,
  Zap,
  Loader2,
  ExternalLink,
  Linkedin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function PostAutopsyPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPostDetails()
    }
  }, [params.id])

  const fetchPostDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else {
        throw new Error('Post not found')
      }
    } catch (error) {
      toast.error('Failed to load post insights')
      router.push('/analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Performing autopsy...</p>
        </div>
      </div>
    )
  }

  if (!post) return null

  const analytics = post.post_analytics?.[0] || {}

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Post Autopsy</h1>
              <p className="text-sm text-gray-500">Deep-dive into performance & insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {post.linkedin_post_id && (
              <a
                href={`https://www.linkedin.com/feed/update/${post.linkedin_post_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-xl text-sm font-semibold hover:bg-[#004182] transition-colors shadow-lg shadow-blue-500/20"
              >
                <Linkedin className="w-4 h-4" />
                View on LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content & Metrics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Post Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your LinkedIn Post</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString()}
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>

            {/* In-depth Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Impressions', value: analytics.views || 0, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Likes', value: analytics.likes || 0, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Comments', value: analytics.comments || 0, icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Shares', value: analytics.shares || 0, icon: Share2, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                  <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-black text-gray-900">{m.value.toLocaleString()}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Engagement Rate Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Engagement Analysis</h3>
                    <p className="text-sm text-gray-500">How your audience interacted</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-orange-600">{(analytics.engagement_rate || 0).toFixed(2)}%</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Engagement Rate</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Performance Benchmark</span>
                    <span className="text-gray-900 font-bold">Above Average</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full"
                      style={{ width: `${Math.min((analytics.engagement_rate || 0) * 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-[#0a66c2] to-[#004182] rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm uppercase tracking-widest">AI Audit</h3>
              </div>
              <p className="text-blue-50 text-sm leading-relaxed mb-6 italic">
                "This post performed well due to its hook and timing. The emotional sentiment resonates strongly with mid-senior professionals in your network."
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-white/10">
                  <Target className="w-4 h-4 text-green-300" />
                  <span className="text-xs font-medium">Optimal Hook Length</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-white/10">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-medium">High Resonance Topic</span>
                </div>
              </div>
            </div>

            {/* Future Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                Next Best Actions
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-600">Repost this content in 4 weeks with a new hook.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-600">Turn this post into a 3-part carousel for broader reach.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
