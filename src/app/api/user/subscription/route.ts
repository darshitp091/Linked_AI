/**
 * User Subscription API
 * Returns the user's current subscription plan
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan, status, posts_limit, ai_credits_limit, posts_used, ai_credits_used')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // If no subscription found, return free plan
      return NextResponse.json({
        success: true,
        plan: 'free',
        status: 'active',
        limits: {
          postsLimit: 10,
          aiCreditsLimit: 50,
          postsUsed: 0,
          aiCreditsUsed: 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      plan: subscription.plan || 'free',
      status: subscription.status || 'active',
      limits: {
        postsLimit: subscription.posts_limit,
        aiCreditsLimit: subscription.ai_credits_limit,
        postsUsed: subscription.posts_used,
        aiCreditsUsed: subscription.ai_credits_used,
      },
    })
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
