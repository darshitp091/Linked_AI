/**
 * Plan Protected Route Component
 * Redirects users to pricing if they don't have access to the feature
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserPlan } from '@/hooks/useUserPlan'
import { canAccessRoute } from '@/lib/plans/features'
import { Loader2, Lock, Crown } from 'lucide-react'

export default function PlanProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { plan, loading } = useUserPlan()

  useEffect(() => {
    if (!loading && pathname) {
      const hasAccess = canAccessRoute(plan, pathname)
      if (!hasAccess) {
        router.push('/pricing')
      }
    }
  }, [plan, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const hasAccess = canAccessRoute(plan, pathname || '')

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            This feature requires a premium plan. Upgrade to access advanced features and unlock your full potential.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <Crown className="w-5 h-5" />
            View Pricing Plans
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
