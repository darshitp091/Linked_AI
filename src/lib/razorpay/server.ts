import Razorpay from 'razorpay'

// Initialize Razorpay instance
export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

// Plan configurations
export const PLAN_CONFIGS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    posts_limit: 5,
    ai_credits: 50,
    features: [
      '5 AI-generated posts/month',
      'Basic scheduling',
      'Auto-posting to LinkedIn',
      'Email support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 699, // ₹699
    posts_limit: 100,
    ai_credits: 500,
    features: [
      '100 AI-generated posts/month',
      'Priority scheduling',
      'Auto-posting to LinkedIn',
      'Priority email support',
      'Basic analytics',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 1699, // ₹1699
    posts_limit: 500,
    ai_credits: 2000,
    features: [
      '500 AI-generated posts/month',
      'Unlimited scheduling',
      'Auto-posting to LinkedIn',
      'Priority 24/7 support',
      'Advanced insights & analytics',
      'Team collaboration',
    ],
  },
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number, currency: string = 'USD', notes?: any) {
  const razorpay = getRazorpayInstance()

  try {
    const order = await razorpay.orders.create({
      amount: amount, // Amount in smallest unit (e.g. cents for USD, paise for INR)
      currency: currency,
      notes: notes || {},
    })

    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

  if (!keySecret) {
    throw new Error('Razorpay key secret is not configured')
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return generatedSignature === signature
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'linkedai_razorpay_webhook_v1'

  if (!webhookSecret) {
    throw new Error('Razorpay webhook secret is not configured')
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return generatedSignature === signature
}
