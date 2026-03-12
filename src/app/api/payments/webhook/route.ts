import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, PLAN_CONFIGS } from '@/lib/razorpay/server'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(payload)
    const supabase = await createClient()

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const notes = payment.notes

      if (notes && notes.user_id && notes.plan) {
        const userId = notes.user_id
        const plan = notes.plan
        const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]

        // Update subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            plan: plan,
            status: 'active',
            posts_limit: planConfig.posts_limit,
            posts_used: 0,
            razorpay_payment_id: payment.id,
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (subError) {
          console.error('Webhook: Error updating subscription:', subError)
        }

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: plan,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Webhook: Error updating profile:', profileError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
