'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ABTestResults from '@/components/ab-testing/ab-test-results'

export default function ABTestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any[]>([])
  const [winnerAnalysis, setWinnerAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTestDetails()
  }, [params.id])

  const fetchTestDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/ab-tests/${params.id}`)

      if (!res.ok) {
        throw new Error('Failed to fetch test details')
      }

      const data = await res.json()
      setTest(data.test)
      setAnalytics(data.analytics || [])
      setWinnerAnalysis(data.winnerAnalysis)
    } catch (error) {
      console.error('Error fetching test details:', error)
      alert('Failed to load test details')
      router.push('/dashboard/ab-tests')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, data?: any) => {
    setActionLoading(true)

    try {
      const res = await fetch(`/api/ab-tests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      })

      if (!res.ok) {
        throw new Error('Failed to perform action')
      }

      await fetchTestDetails()
      alert('Action completed successfully')
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Failed to perform action')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartTest = () => {
    if (confirm('Are you sure you want to start this test? All variants will be published.')) {
      handleAction('start')
    }
  }

  const handlePauseTest = () => {
    if (confirm('Are you sure you want to pause this test?')) {
      handleAction('pause')
    }
  }

  const handleCompleteTest = () => {
    if (confirm('Are you sure you want to complete this test?')) {
      handleAction('complete')
    }
  }

  const handleSelectWinner = (variantId: string) => {
    if (confirm('Are you sure you want to select this variant as the winner?')) {
      handleAction('select_winner', { winner_variant_id: variantId })
    }
  }

  const handleSyncMetrics = () => {
    handleAction('sync_metrics')
  }

  const handleDeleteTest = async () => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/ab-tests/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/dashboard/ab-tests')
      } else {
        alert('Failed to delete test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Failed to delete test')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading test details...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">Test not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/ab-tests')}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to A/B Tests</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex items-center space-x-3">
        {test.status === 'draft' && (
          <Button onClick={handleStartTest} disabled={actionLoading}>
            Start Test
          </Button>
        )}
        {test.status === 'active' && (
          <>
            <Button onClick={handlePauseTest} disabled={actionLoading} variant="outline">
              Pause Test
            </Button>
            <Button onClick={handleCompleteTest} disabled={actionLoading}>
              Complete Test
            </Button>
          </>
        )}
        {test.status === 'paused' && (
          <Button onClick={handleStartTest} disabled={actionLoading}>
            Resume Test
          </Button>
        )}
        <Button onClick={handleSyncMetrics} disabled={actionLoading} variant="outline">
          Sync Metrics
        </Button>
        {test.status === 'draft' && (
          <Button
            onClick={handleDeleteTest}
            disabled={actionLoading}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            Delete Test
          </Button>
        )}
      </div>

      {/* Results Dashboard */}
      <ABTestResults
        test={test}
        analytics={analytics}
        winnerAnalysis={winnerAnalysis}
        onSelectWinner={handleSelectWinner}
        onRefresh={fetchTestDetails}
      />
    </div>
  )
}
