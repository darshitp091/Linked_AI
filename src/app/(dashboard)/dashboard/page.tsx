'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Wand2, FileText, Clock, TrendingUp, Plus, ArrowRight, Sparkles,
  Calendar, Target, Zap, BarChart3, ChevronRight, Rocket
} from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [greeting, setGreeting] = useState('Hello')
  const [stats, setStats] = useState([
    { label: 'Posts Generated', value: '0', icon: Wand2, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', change: '+0 this week' },
    { label: 'Drafts', value: '0', icon: FileText, color: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-50', change: '0 pending' },
    { label: 'Scheduled', value: '0', icon: Clock, color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50', change: 'Next: --' },
    { label: 'Published', value: '0', icon: TrendingUp, color: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50', change: '+0% reach' },
  ])
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchStats(user.id)
      }
    }
    getUser()

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [supabase.auth])

  const fetchStats = async (userId: string) => {
    try {
      // Fetch all posts for the user
      const { data: allPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)

      // Count posts by status
      const totalGenerated = allPosts?.length || 0
      const draftsCount = allPosts?.filter(p => p.status === 'draft').length || 0
      const scheduledCount = allPosts?.filter(p => p.status === 'scheduled').length || 0
      const publishedCount = allPosts?.filter(p => p.status === 'published').length || 0

      // Count posts this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const thisWeekCount = allPosts?.filter(p => new Date(p.created_at) > weekAgo).length || 0

      // Get next scheduled post
      const nextScheduled = allPosts
        ?.filter(p => p.status === 'scheduled' && p.scheduled_for)
        .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())[0]

      const nextScheduledText = nextScheduled
        ? new Date(nextScheduled.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '--'

      setStats([
        { label: 'Posts Generated', value: totalGenerated.toString(), icon: Wand2, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', change: `+${thisWeekCount} this week` },
        { label: 'Drafts', value: draftsCount.toString(), icon: FileText, color: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-50', change: `${draftsCount} pending` },
        { label: 'Scheduled', value: scheduledCount.toString(), icon: Clock, color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50', change: `Next: ${nextScheduledText}` },
        { label: 'Published', value: publishedCount.toString(), icon: TrendingUp, color: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50', change: `${publishedCount} total` },
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const quickActions = [
    { href: '/generate', icon: Wand2, label: 'Generate Posts', desc: 'Create AI content', primary: true },
    { href: '/drafts', icon: FileText, label: 'View Drafts', desc: 'Edit saved posts', primary: false },
    { href: '/calendar', icon: Calendar, label: 'Schedule', desc: 'Plan your week', primary: false },
    { href: '/scheduled', icon: Clock, label: 'Queue', desc: 'Upcoming posts', primary: false },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {greeting}{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your LinkedIn content</p>
        </div>
        <Link href="/generate">
          <Button className="gap-2">
            <Sparkles className="w-4 h-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards - New Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />

            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <Link href="/generate" className="text-sm text-[#0a66c2] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className={`group p-4 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-md ${
                  action.primary
                    ? 'border-[#0a66c2] bg-[#0a66c2]/5 hover:bg-[#0a66c2]/10'
                    : 'border-gray-100 hover:border-[#0a66c2]/30 bg-gray-50/50 hover:bg-white'
                }`}>
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors ${
                    action.primary
                      ? 'bg-[#0a66c2] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 group-hover:border-[#0a66c2]/30 group-hover:text-[#0a66c2]'
                  }`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <p className={`text-sm font-medium ${action.primary ? 'text-[#0a66c2]' : 'text-gray-700'}`}>{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-gradient-to-br from-[#0a66c2] to-[#004182] rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Weekly Goal</span>
            </div>

            <div className="mb-4">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">0</span>
                <span className="text-white/60 mb-1">/ 7 posts</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            <p className="text-sm text-white/70 mb-4">Stay consistent! Post regularly to grow your audience.</p>

            <Link href="/generate">
              <button className="w-full flex items-center justify-center gap-2 bg-white text-[#0a66c2] px-4 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition">
                <Rocket className="w-4 h-4" />
                Start Creating
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link href="/drafts" className="text-sm text-[#0a66c2] hover:underline">View all</Link>
          </div>

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No posts yet</h3>
            <p className="text-gray-400 text-sm mb-4 max-w-[200px]">Create your first AI-powered LinkedIn post</p>
            <Link href="/generate">
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Tips & Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Tips & Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
              <div className="w-8 h-8 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-[#0a66c2]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Best time to post</p>
                <p className="text-xs text-gray-500">Tuesday & Wednesday, 9-10 AM get highest engagement</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Pro tip</p>
                <p className="text-xs text-gray-500">Posts with questions get 50% more comments</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50/50 border border-violet-100/50">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Consistency matters</p>
                <p className="text-xs text-gray-500">Posting 3-5 times weekly increases followers by 2x</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
