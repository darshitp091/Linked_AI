import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 *
 * This client bypasses Row Level Security (RLS) policies.
 * Use ONLY in API routes and server-side code where you need admin access.
 *
 * NEVER expose this client to the browser or client-side code!
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Export a singleton instance for convenience
export const supabaseAdmin = createAdminClient()
