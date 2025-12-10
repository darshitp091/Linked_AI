'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ABTestList from '@/components/ab-testing/ab-test-list'
import UpgradePrompt from '@/components/ab-testing/upgrade-prompt'
import { canCreateABTest } from '@/lib/ab-testing/plan-limits'

export default function ABTestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [canAccess, setCanAccess] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all')

  useEffect(() => {
    fetchUserPlan()
    fetchTests()
  }, [filter])

  const fetchUserPlan = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        const plan = data.profile?.subscription_plan || 'free'
        setUserPlan(plan)
        setCanAccess(canCreateABTest(plan))
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const fetchTests = async () => {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? '/api/ab-tests'
        : `/api/ab-tests?status=${filter}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error('Error fetching A/B tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this A/B test?')) return

    try {
      const res = await fetch(`/api/ab-tests/${testId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTests(tests.filter(t => t.id !== testId))
      } else {
        alert('Failed to delete test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Failed to delete test')
    }
  }

  if (!canAccess) {
    return <UpgradePrompt currentPlan={userPlan} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B Tests</h1>
          <p className="text-gray-600 mt-2">
            Optimize your LinkedIn content with data-driven A/B testing
          </p>
        </div>
        <Link href="/dashboard/ab-tests/new">
          <Button>
            Create New Test
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm text-gray-500 mb-1">Total Tests</div>
          <div className="text-2xl font-bold">{tests.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm text-gray-500 mb-1">Active Tests</div>
          <div className="text-2xl font-bold text-green-600">
            {tests.filter(t => t.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm text-gray-500 mb-1">Completed</div>
          <div className="text-2xl font-bold text-blue-600">
            {tests.filter(t => t.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm text-gray-500 mb-1">Winners Found</div>
          <div className="text-2xl font-bold text-purple-600">
            {tests.filter(t => t.winner_variant_id).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { value: 'all', label: 'All Tests' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'draft', label: 'Drafts' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tests...</p>
        </div>
      ) : (
        <ABTestList tests={tests} onDelete={handleDelete} />
      )}
    </div>
  )
}
