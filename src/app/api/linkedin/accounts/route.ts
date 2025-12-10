import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserLinkedInAccounts } from '@/lib/linkedin/accounts'

/**
 * GET /api/linkedin/accounts
 * Get all LinkedIn accounts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    const accounts = await getUserLinkedInAccounts(user.id, activeOnly)

    return NextResponse.json({
      accounts,
      count: accounts.length,
    })
  } catch (error: any) {
    console.error('Error fetching LinkedIn accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch LinkedIn accounts' },
      { status: 500 }
    )
  }
}
