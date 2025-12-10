import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserNotifications, getUnreadCount } from '@/lib/notifications'

/**
 * GET /api/notifications
 * Get user's notifications
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const countOnly = searchParams.get('countOnly') === 'true'

    if (countOnly) {
      const count = await getUnreadCount(user.id)
      return NextResponse.json({ count })
    }

    const notifications = await getUserNotifications(user.id, unreadOnly)

    return NextResponse.json({
      notifications,
      count: notifications.length,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
