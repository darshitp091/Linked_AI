import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markAllNotificationsRead } from '@/lib/notifications'

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await markAllNotificationsRead(user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}
