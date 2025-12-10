'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ABTestWizard from '@/components/ab-testing/ab-test-wizard'
import { getABTestingLimits } from '@/lib/ab-testing/plan-limits'

// This page can't be statically generated due to dynamic routing
export const dynamic = 'force-dynamic'

export default function NewABTestPage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (testConfig: any) => {
    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.requiresUpgrade) {
          setError(data.error)
          setTimeout(() => router.push('/pricing'), 2000)
          return
        }
        throw new Error(data.error || 'Failed to create test')
      }

      // Success - redirect to test details
      router.push(`/dashboard/ab-tests/${data.test.id}`)
    } catch (err: any) {
      console.error('Error creating A/B test:', err)
      setError(err.message || 'Failed to create A/B test')
      setCreating(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/ab-tests')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New A/B Test</h1>
        <p className="text-gray-600 mt-2">
          Set up a new A/B test to optimize your LinkedIn content performance
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {creating ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Creating your A/B test...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-8">
          <ABTestWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
            maxVariants={5} // Will be validated by backend based on plan
          />
        </div>
      )}
    </div>
  )
}
