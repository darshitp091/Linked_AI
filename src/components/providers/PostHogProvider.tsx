'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog } from '@/lib/analytics/posthog'
import posthog from 'posthog-js'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const hasKey = process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'your_posthog_key_here';

  // Initialize PostHog on mount only if key exists
  useEffect(() => {
    if (hasKey) {
      initPostHog()
    }
  }, [hasKey])

  if (!hasKey) {
    return <>{children}</>
  }

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}
