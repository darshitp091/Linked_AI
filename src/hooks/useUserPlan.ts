/**
 * Hook to fetch and cache user's subscription plan
 */

import { useEffect, useState } from 'react'
import { Plan } from '@/lib/plans/features'

export function useUserPlan() {
  const [plan, setPlan] = useState<Plan>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPlan()
  }, [])

  const fetchUserPlan = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setPlan(data.plan || 'free')
      } else {
        setPlan('free')
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
      setPlan('free')
    } finally {
      setLoading(false)
    }
  }

  return { plan, loading, refetch: fetchUserPlan }
}
