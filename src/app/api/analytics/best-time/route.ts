import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateBestTimeRecommendations,
  getNextBestTime,
  hasBestTimeAccess,
} from '@/lib/ai/best-time'

/**
 * GET /api/analytics/best-time
 * Get AI-powered best time to post recommendations
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

    // Get user's subscription plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user has access to this feature
    if (!hasBestTimeAccess(profile.subscription_plan)) {
      return NextResponse.json(
        {
          error: 'This feature is available on Pro, Standard, and Custom plans',
          requiredPlan: 'pro',
          currentPlan: profile.subscription_plan,
        },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const nextOnly = searchParams.get('nextOnly') === 'true'

    if (nextOnly) {
      // Just return the next best time
      const nextBest = await getNextBestTime(user.id)
      return NextResponse.json(nextBest)
    }

    // Generate full recommendations
    const recommendations = await generateBestTimeRecommendations(user.id)

    return NextResponse.json(recommendations)
  } catch (error: any) {
    console.error('Error generating best time recommendations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
