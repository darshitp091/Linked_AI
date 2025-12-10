'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * Session Provider - Simple wrapper component
 * Note: We use Supabase for authentication, not NextAuth
 * This component is kept for compatibility but doesn't use NextAuth anymore
 */
export function SessionProvider({ children }: Props) {
  return <>{children}</>
}
