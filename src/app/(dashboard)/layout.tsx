'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Linkedin, LayoutDashboard, Wand2, Calendar, FileText, Clock, Settings, LogOut, Menu, X, Sparkles, LifeBuoy, BarChart3, Building2, Bell, Zap, Key, TrendingUp, TestTube2, Lock, Users, Target, Eye, MessageSquare, Lightbulb, LineChart } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import WorkspaceSwitcher from '@/components/workspaces/workspace-switcher'
import NotificationBell from '@/components/notifications/notification-bell'
import { useUserPlan } from '@/hooks/useUserPlan'
import { canAccessRoute } from '@/lib/plans/features'

// Dashboard requires authentication, disable static generation
export const dynamic = 'force-dynamic'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiresPlan: false },
  { href: '/generate', icon: Wand2, label: 'Generate', requiresPlan: false },
  { href: '/templates', icon: Sparkles, label: 'Templates', requiresPlan: false },
  { href: '/drafts', icon: FileText, label: 'Drafts', requiresPlan: false },
  { href: '/calendar', icon: Calendar, label: 'Calendar', requiresPlan: false },
  { href: '/scheduled', icon: Clock, label: 'Scheduled', requiresPlan: false },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', badge: 'Pro', requiresPlan: true },
  { href: '/best-time', icon: TrendingUp, label: 'Best Time', badge: 'Pro', requiresPlan: true },
  { href: '/ab-tests', icon: TestTube2, label: 'A/B Tests', badge: 'Pro', requiresPlan: true },
  // NEW UNIQUE FEATURES
  { href: '/leads', icon: Users, label: 'Lead Generation', badge: 'New', requiresPlan: false },
  { href: '/viral-score', icon: Target, label: 'Viral Predictor', badge: 'New', requiresPlan: false },
  { href: '/audience-growth', icon: LineChart, label: 'Audience Growth', requiresPlan: false },
  { href: '/competitors', icon: Eye, label: 'Competitors', badge: 'Pro', requiresPlan: true },
  { href: '/trending', icon: Zap, label: 'Trending Topics', requiresPlan: false },
  { href: '/content-ideas', icon: Lightbulb, label: 'Content Ideas', requiresPlan: false },
  { href: '/top-engagers', icon: MessageSquare, label: 'Top Engagers', badge: 'Pro', requiresPlan: true },
  // ENTERPRISE FEATURES
  { href: '/workspaces', icon: Building2, label: 'Workspaces', badge: 'Enterprise', requiresPlan: true },
  { href: '/api-docs', icon: Key, label: 'API Docs', badge: 'Enterprise', requiresPlan: true },
  // SETTINGS & SUPPORT
  { href: '/notifications', icon: Bell, label: 'Notifications', requiresPlan: false },
  { href: '/settings', icon: Settings, label: 'Settings', requiresPlan: false },
  { href: '/support', icon: LifeBuoy, label: 'Support', requiresPlan: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { plan, loading: planLoading } = useUserPlan()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/linkedai-logo.png"
                alt="LinkedAI Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
                unoptimized
              />
            </Link>

            {/* Notification Bell */}
            <NotificationBell />
          </div>

          {/* Workspace Switcher */}
          <div className="mt-4">
            <WorkspaceSwitcher />
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {navItems
            .filter((item) => !item.requiresPlan || canAccessRoute(plan, item.href))
            .map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const hasAccess = canAccessRoute(plan, item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition mb-1 relative
                    ${isActive
                      ? 'bg-[#0a66c2]/10 text-[#0a66c2] font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      px-2 py-0.5 text-xs font-semibold rounded-full
                      ${item.badge === 'Pro' ? 'bg-purple-100 text-purple-700' : ''}
                      ${item.badge === 'Enterprise' ? 'bg-blue-100 text-blue-700' : ''}
                      ${item.badge === 'New' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
