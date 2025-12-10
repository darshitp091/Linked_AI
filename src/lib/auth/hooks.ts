'use client'

import { useSession } from 'next-auth/react'

/**
 * Custom hook to get current user session
 * Returns user data and loading state
 */
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  }
}

/**
 * Hook to require authentication
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return {
    user,
    isLoading,
    isAuthenticated,
  }
}
