import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, PLAN_CONFIGS } from '@/lib/razorpay/server'
import { updateAccountLimit } from '@/lib/linkedin/accounts'

// Helper function to get plan limits
function getPlanLimits(plan: string) {
  const config = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.free
  return {
    posts_limit: config.posts_limit,
    ai_credits: config.ai_credits,
    linkedin_accounts_limit: plan === 'free' ? 1 : plan === 'pro' ? 5 : plan === 'standard' ? 10 : 999
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Razorpay webhook received')

    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('❌ Missing webhook signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const payload = await request.text()
    console.log('📦 Webhook payload:', payload.substring(0, 200) + '...')

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature)

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(payload)
    const supabase = await createClient()

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Payment was successful
        const paymentId = event.payload.payment.entity.id
        const orderId = event.payload.payment.entity.order_id
        const notes = event.payload.payment.entity.notes

        if (notes && notes.user_id && notes.plan) {
          const limits = getPlanLimits(notes.plan)

          // 1. Update subscriptions table with plan and limits
          await supabase
            .from('subscriptions')
            .update({
              plan: notes.plan,
              status: 'active',
              posts_remaining: limits.posts_limit,
              razorpay_payment_id: paymentId,
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', notes.user_id)

          // 2. Update profiles table with subscription plan
          await supabase
            .from('profiles')
            .update({
              subscription_plan: notes.plan,
              posts_limit: limits.posts_limit,
              updated_at: new Date().toISOString(),
            })
            .eq('id', notes.user_id)

          // 3. Update LinkedIn account limit
          await updateAccountLimit(notes.user_id, notes.plan)

          console.log(`✅ Payment captured: User ${notes.user_id} upgraded to ${notes.plan} plan`)
        }
        break

      case 'payment.failed':
        // Payment failed
        const failedNotes = event.payload.payment.entity.notes

        if (failedNotes && failedNotes.user_id) {
          // Mark subscription as past_due, don't downgrade plan yet
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', failedNotes.user_id)

          console.log(`⚠️ Payment failed: User ${failedNotes.user_id}`)
        }
        break

      case 'subscription.cancelled':
        // Subscription was cancelled
        const subscriptionId = event.payload.subscription.entity.id

        // Downgrade to free plan
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('razorpay_subscription_id', subscriptionId)
          .single()

        if (subscription?.user_id) {
          const freeLimits = getPlanLimits('free')

          // Update subscription to free plan
          await supabase
            .from('subscriptions')
            .update({
              plan: 'free',
              status: 'cancelled',
              posts_remaining: freeLimits.posts_limit,
              updated_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', subscriptionId)

          // Update profiles to free plan
          await supabase
            .from('profiles')
            .update({
              subscription_plan: 'free',
              posts_limit: freeLimits.posts_limit,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.user_id)

          // Update LinkedIn account limit to 1
          await updateAccountLimit(subscription.user_id, 'free')

          console.log(`🔻 Subscription cancelled: User ${subscription.user_id} downgraded to free`)
        }
        break

      default:
        console.log('❓ Unhandled webhook event:', event.event, JSON.stringify(event, null, 2))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
