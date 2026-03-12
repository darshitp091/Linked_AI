import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Call the Postgres function to renew credits
    const { error } = await supabase.rpc('check_and_renew_credits')

    if (error) {
      console.error('[Cron] Error calling check_and_renew_credits:', error)
      return NextResponse.json(
        { error: 'Failed to renew credits', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Cron] Monthly credits renewal checked and processed successfully')

    return NextResponse.json({
      success: true,
      message: 'Monthly credits renewal processed',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Cron] Fatal error in credit renewal:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
