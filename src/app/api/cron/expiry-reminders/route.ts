import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyPlanExpiry } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return handleCron(request)
}

export async function GET(request: NextRequest) {
  return handleCron(request)
}

async function handleCron(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 1. Find users who expire in exactly 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const startOfTarget = new Date(sevenDaysFromNow)
    startOfTarget.setHours(0, 0, 0, 0)
    const endOfTarget = new Date(sevenDaysFromNow)
    endOfTarget.setHours(23, 59, 59, 999)

    const { data: expiringSoon, error: soonError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, current_period_end')
      .neq('plan', 'free')
      .gte('current_period_end', startOfTarget.toISOString())
      .lte('current_period_end', endOfTarget.toISOString())

    if (soonError) throw soonError

    // 2. Find users who expire today
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const { data: expiringToday, error: todayError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, current_period_end')
      .neq('plan', 'free')
      .gte('current_period_end', startOfToday.toISOString())
      .lte('current_period_end', endOfToday.toISOString())

    if (todayError) throw todayError

    let remindersSent = 0

    // Process 7-day warnings
    if (expiringSoon) {
      for (const sub of expiringSoon) {
        await notifyPlanExpiry(sub.user_id, sub.plan, 7)
        remindersSent++
      }
    }

    // Process expiry day warnings
    if (expiringToday) {
      for (const sub of expiringToday) {
        await notifyPlanExpiry(sub.user_id, sub.plan, 0)
        remindersSent++
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Cron] Error in expiry reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
