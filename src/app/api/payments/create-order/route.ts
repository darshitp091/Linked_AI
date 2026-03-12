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
    const { plan, currency = 'USD' } = body

    if (!plan || !['pro', 'standard'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]
    
    // Map of USD prices to INR (hardcoded for now as requested)
    const priceMap: Record<string, Record<string, number>> = {
      pro: { USD: 799, INR: 69900 }, // $7.99 in cents vs ₹699 in paise
      standard: { USD: 1499, INR: 129900 }, // $14.99 in cents vs ₹1299 in paise
    }

    const amount = priceMap[plan][currency] || planConfig.price

    // Create Razorpay order
    const order = await createRazorpayOrder(amount, currency, {
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
