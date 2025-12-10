/**
 * Analytics Trend API
 * Returns time-series analytics data for charts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnalyticsTrend } from '@/lib/linkedin/analytics'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Validate days parameter (max 365 days)
    const validDays = Math.min(Math.max(days, 1), 365)

    // Get trend data
    const trendData = await getAnalyticsTrend(user.id, validDays)

    return NextResponse.json({
      success: true,
      data: trendData,
      period: {
        days: validDays,
        from: new Date(Date.now() - validDays * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error fetching analytics trend:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics trend',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
