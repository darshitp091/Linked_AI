import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeAPIKey, deleteAPIKey } from '@/lib/api-keys'

/**
 * PATCH /api/api-keys/[id]
 * Revoke an API key
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'revoke') {
      const result = await revokeAPIKey(id, user.id)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'API key revoked successfully',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update API key' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/api-keys/[id]
 * Delete an API key permanently
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await deleteAPIKey(id, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
