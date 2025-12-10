/**
 * Analytics Overview API
 * Returns aggregated analytics summary for the user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserAnalyticsSummary } from '@/lib/linkedin/analytics'

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

    // Get user's profile for plan checking
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    // Check if user has access to analytics (all plans have basic access)
    // But advanced analytics might be gated
    const plan = profile?.subscription_plan || 'free'

    // Get analytics summary
    const summary = await getUserAnalyticsSummary(user.id)

    return NextResponse.json({
      success: true,
      data: summary,
      plan,
      features: {
        hasAdvancedAnalytics: ['pro', 'standard', 'custom'].includes(plan.toLowerCase()),
        hasExportData: ['standard', 'custom'].includes(plan.toLowerCase()),
      },
    })
  } catch (error: any) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
