'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, TrendingUp, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ScheduledPost {
  id: string
  content: string
  topic?: string
  scheduled_for: string
  google_calendar_event_id?: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: Date; hour: number } | null>(null)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    thisWeek: 0,
    published: 0,
    upcoming: 0
  })

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

  useEffect(() => {
    fetchScheduledPosts()
  }, [currentDate])

  const fetchScheduledPosts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Fetch scheduled posts
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true })

      if (error) {
        console.error('Error fetching scheduled posts:', error)
        return
      }

      setScheduledPosts(posts || [])

      // Calculate stats
      const weekEnd = addDays(weekStart, 7)
      const thisWeekPosts = posts?.filter(p => {
        const postDate = parseISO(p.scheduled_for)
        return postDate >= weekStart && postDate < weekEnd
      }).length || 0

      const upcomingPosts = posts?.filter(p => {
        const postDate = parseISO(p.scheduled_for)
        return postDate > new Date()
      }).length || 0

      // Get published count
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'published')

      setStats({
        thisWeek: thisWeekPosts,
        published: count || 0,
        upcoming: upcomingPosts
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPostsForSlot = (day: Date, hour: number) => {
    return scheduledPosts.filter(post => {
      const postDate = parseISO(post.scheduled_for)
      return isSameDay(postDate, day) && postDate.getHours() === hour
    })
  }

  const handleSlotClick = (day: Date, hour: number) => {
    const postsInSlot = getPostsForSlot(day, hour)
    if (postsInSlot.length === 0) {
      setSelectedSlot({ day, hour })
      setShowScheduleModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600">Plan and schedule your LinkedIn posts</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.thisWeek}</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-[#0a66c2]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
                <div className="text-sm text-gray-500">Upcoming</div>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(addDays(currentDate, -7))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addDays(currentDate, 7))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
          <div className="p-4 text-gray-500 text-sm font-semibold">Time</div>
          {days.map((day) => (
            <div
              key={day.toString()}
              className={`p-4 text-center border-l border-gray-200 ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                {format(day, 'EEE')}
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  isSameDay(day, new Date()) ? 'text-[#0a66c2]' : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading calendar...</p>
            </div>
          ) : (
            timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <div className="p-4 text-gray-500 text-sm font-medium bg-gray-50/50">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                {days.map((day) => {
                  const postsInSlot = getPostsForSlot(day, hour)
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="relative p-2 border-l border-gray-100 min-h-[80px] group"
                    >
                      {postsInSlot.length > 0 ? (
                        <div className="space-y-1">
                          {postsInSlot.map((post) => (
                            <Link
                              key={post.id}
                              href={`/scheduled`}
                              className="block"
                            >
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg text-xs hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold truncate flex-1">
                                    {post.topic || 'Untitled'}
                                  </span>
                                  {post.google_calendar_event_id && (
                                    <CalendarIcon className="w-3 h-3 ml-1 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="text-[10px] opacity-90 line-clamp-2">
                                  {post.content.substring(0, 50)}...
                                </div>
                                <div className="text-[10px] opacity-75 mt-1">
                                  {format(parseISO(post.scheduled_for), 'h:mm a')}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSlotClick(day, hour)}
                          className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a66c2] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Post</h3>
            <p className="text-gray-600 mb-4">
              {format(selectedSlot.day, 'EEEE, MMMM d, yyyy')} at {format(new Date().setHours(selectedSlot.hour, 0), 'h:00 a')}
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700">
                Select a draft from your drafts page to schedule for this time slot.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <Link href="/drafts" className="flex-1">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="w-full px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  Go to Drafts
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
