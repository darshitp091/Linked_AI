'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock, Edit, Trash2, Calendar, CheckCircle, AlertCircle, TrendingUp, CalendarCheck2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, addDays } from 'date-fns'
import { ScheduleModal } from '@/components/scheduling/schedule-modal'

interface ScheduledPost {
  id: string
  content: string
  topic?: string
  scheduled_for: string
  google_calendar_event_id?: string
  created_at: string
}

export default function ScheduledPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    next24h: 0
  })

  useEffect(() => {
    fetchScheduledPosts()
  }, [])

  const fetchScheduledPosts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true })

      if (error) {
        console.error('Error fetching scheduled posts:', error)
        return
      }

      setScheduledPosts(data || [])

      // Calculate stats
      const now = new Date()
      const weekLater = addDays(now, 7)
      const dayLater = addDays(now, 1)

      const thisWeekCount = data?.filter(p => {
        const postDate = parseISO(p.scheduled_for)
        return postDate >= now && postDate <= weekLater
      }).length || 0

      const next24hCount = data?.filter(p => {
        const postDate = parseISO(p.scheduled_for)
        return postDate >= now && postDate <= dayLater
      }).length || 0

      setStats({
        total: data?.length || 0,
        thisWeek: thisWeekCount,
        next24h: next24hCount
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async (postId: string, scheduledFor: Date, syncToGoogleCalendar: boolean) => {
    try {
      const supabase = createClient()
      const post = scheduledPosts.find(p => p.id === postId)

      // Update post schedule
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          scheduled_for: scheduledFor.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      if (updateError) throw updateError

      // Update Google Calendar if synced
      if (post?.google_calendar_event_id && syncToGoogleCalendar) {
        await fetch('/api/calendar/update-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: post.google_calendar_event_id,
            title: `📱 LinkedIn Post: ${post.topic || 'Untitled'}`,
            description: post.content,
            startTime: scheduledFor.toISOString(),
            endTime: new Date(scheduledFor.getTime() + 15 * 60000).toISOString()
          })
        })
      }

      await fetchScheduledPosts()
      setIsRescheduleModalOpen(false)
      setSelectedPost(null)
    } catch (error: any) {
      console.error('Error rescheduling:', error)
      throw error
    }
  }

  const handleCancelSchedule = async (postId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post? It will be moved back to drafts.')) return

    try {
      const supabase = createClient()
      const post = scheduledPosts.find(p => p.id === postId)

      // Update post status to draft
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          status: 'draft',
          scheduled_for: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      if (updateError) throw updateError

      // Delete Google Calendar event if exists
      if (post?.google_calendar_event_id) {
        await fetch('/api/calendar/delete-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: post.google_calendar_event_id })
        })
      }

      await fetchScheduledPosts()
    } catch (error) {
      console.error('Error canceling schedule:', error)
    }
  }

  const getTimeUntilPost = (scheduledFor: string) => {
    const now = new Date()
    const postDate = parseISO(scheduledFor)
    const diffMs = postDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 1) return `in ${diffDays} days`
    if (diffHours > 1) return `in ${diffHours} hours`
    if (diffHours === 1) return 'in 1 hour'
    return 'soon'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduled Posts</h1>
            <p className="text-gray-600">Manage your queued content</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Scheduled</div>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#0a66c2]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.thisWeek}</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.next24h}</div>
                <div className="text-sm text-gray-500">Next 24h</div>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Posts List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading scheduled posts...</p>
        </div>
      ) : scheduledPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No scheduled posts</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Plan your content strategy by scheduling posts from your drafts or calendar
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/calendar">
              <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-6 text-base rounded-xl shadow-lg shadow-blue-500/20">
                <Calendar className="w-5 h-5 mr-2" />
                Open Calendar
              </Button>
            </Link>
            <Link href="/drafts">
              <Button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-6 text-base rounded-xl shadow-sm">
                View Drafts
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((post, index) => (
            <div
              key={post.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Post Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">
                      {format(parseISO(post.scheduled_for), 'EEE, MMM d, yyyy - h:mm a')}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({getTimeUntilPost(post.scheduled_for)})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.google_calendar_event_id && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200 flex items-center gap-1">
                      <CalendarCheck2 className="w-3 h-3" />
                      Synced
                    </span>
                  )}
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Ready
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                {post.topic && (
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">{post.topic}</h3>
                )}
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4 line-clamp-4">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPost(post)
                        setIsRescheduleModalOpen(true)
                      }}
                      className="px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      Reschedule
                    </button>
                    <Link href={`/calendar`}>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                        <CalendarCheck2 className="w-4 h-4" />
                        View on Calendar
                      </button>
                    </Link>
                  </div>
                  <button
                    onClick={() => handleCancelSchedule(post.id)}
                    className="px-4 py-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {scheduledPosts.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#0a66c2]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Scheduling Tips</h3>
              <p className="text-sm text-gray-600 mb-3">
                Post during peak engagement hours (8-10 AM, 12-1 PM, 5-6 PM) for maximum reach.
              </p>
              <Link href="/calendar">
                <button className="text-sm font-medium text-[#0a66c2] hover:underline">
                  View optimal posting times →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedPost && (
        <ScheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false)
            setSelectedPost(null)
          }}
          post={selectedPost}
          onSchedule={handleReschedule}
        />
      )}
    </div>
  )
}
