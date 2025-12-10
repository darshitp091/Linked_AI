import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getLinkedInAccountById,
  updateLinkedInAccount,
  setPrimaryLinkedInAccount,
  deactivateLinkedInAccount,
  deleteLinkedInAccount,
} from '@/lib/linkedin/accounts'

/**
 * GET /api/linkedin/accounts/[accountId]
 * Get a specific LinkedIn account
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const account = await getLinkedInAccountById(accountId)

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (account.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ account })
  } catch (error: any) {
    console.error('Error fetching LinkedIn account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch LinkedIn account' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/linkedin/accounts/[accountId]
 * Update a LinkedIn account
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...updates } = body

    // Handle special actions
    if (action === 'set_primary') {
      const result = await setPrimaryLinkedInAccount(accountId, user.id)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: 'Primary account updated' })
    }

    if (action === 'deactivate') {
      const result = await deactivateLinkedInAccount(accountId, user.id)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: 'Account deactivated' })
    }

    // Regular update
    const result = await updateLinkedInAccount(accountId, updates)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      account: result.account,
    })
  } catch (error: any) {
    console.error('Error updating LinkedIn account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update LinkedIn account' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/linkedin/accounts/[accountId]
 * Delete a LinkedIn account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await deleteLinkedInAccount(accountId, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting LinkedIn account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete LinkedIn account' },
      { status: 500 }
    )
  }
}
