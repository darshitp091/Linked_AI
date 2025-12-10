import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRazorpayOrder, PLAN_CONFIGS } from '@/lib/razorpay/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['pro', 'standard', 'custom'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Custom plan requires contact - don't create order
    if (plan === 'custom') {
      return NextResponse.json(
        { error: 'Please contact us for custom pricing' },
        { status: 400 }
      )
    }

    const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]

    // Create Razorpay order
    const order = await createRazorpayOrder(planConfig.price, {
      user_id: user.id,
      plan: plan,
      email: user.email,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
