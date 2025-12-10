/**
 * Cron Job: Analytics Sync
 * Endpoint for scheduled analytics synchronization
 *
 * This endpoint should be called by a cron job service (e.g., Vercel Cron, GitHub Actions)
 * Recommended schedule: Every 6 hours
 *
 * Security: Protected by API key in headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncAnalyticsForAllUsers } from '@/lib/jobs/analytics-sync'

export const maxDuration = 300 // 5 minutes max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron jobs not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron] Unauthorized cron job attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting analytics sync job...')

    // Run the sync
    const result = await syncAnalyticsForAllUsers()

    console.log('[Cron] Analytics sync completed:', {
      usersSynced: result.usersSynced,
      totalSynced: result.totalSynced,
      totalFailed: result.totalFailed,
      errorCount: result.errors.length,
    })

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      stats: {
        usersSynced: result.usersSynced,
        postsSynced: result.totalSynced,
        postsFailed: result.totalFailed,
      },
      errors: result.errors,
    })
  } catch (error: any) {
    console.error('[Cron] Fatal error in analytics sync:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for flexibility with different cron services
  return GET(request)
}
