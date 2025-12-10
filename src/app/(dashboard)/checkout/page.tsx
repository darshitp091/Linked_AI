'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Sparkles, Zap, Star, Shield, CreditCard } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

const planDetails = {
  pro: {
    name: 'Pro',
    price: 29,
    currency: '$',
    period: 'month',
    icon: Zap,
    color: 'from-[#0a66c2] to-blue-600',
    features: [
      '100 AI-generated posts/month',
      '500 lead discoveries/week',
      '5 LinkedIn accounts',
      '100 viral predictions/month',
      'Audience growth + insights',
      'Track 3 competitors',
      'Top 10 engagers tracking',
      '20 AI comment replies/month',
      '20 AI content ideas/week',
      'Advanced analytics dashboard',
      'A/B testing (2 variants)',
      'Priority support',
    ],
  },
  standard: {
    name: 'Standard',
    price: 79,
    currency: '$',
    period: 'month',
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    features: [
      '500 AI-generated posts/month',
      '2000 lead discoveries/week',
      '10 LinkedIn accounts',
      'Unlimited viral predictions',
      'Advanced audience intelligence',
      'Track 10 competitors',
      'Top 50 engagers tracking',
      '100 AI comment replies/month',
      '50 AI content ideas/week',
      'Team collaboration (5 users)',
      'Content calendar',
      'A/B testing (5 variants)',
      'Custom branding',
      'API access',
      'White-label reports',
    ],
  },
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') as 'pro' | 'standard'

  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const plan = planDetails[planId]

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/checkout?plan=' + planId)
        return
      }

      setUser(user)
    }

    checkAuth()
  }, [router, planId])

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!user || !scriptLoaded) {
      setError('Please wait while we load the payment system...')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { orderId, amount, currency, keyId } = await orderResponse.json()

      // Initialize Razorpay payment
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'LinkedAI',
        description: `${plan.name} Plan Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          setProcessing(true)
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan: planId,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const result = await verifyResponse.json()

            // Redirect to success page
            router.push(`/dashboard?payment=success&plan=${planId}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            setError('Payment verification failed. Please contact support.')
            setProcessing(false)
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#0a66c2',
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            setError('Payment cancelled. You can try again when ready.')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      setLoading(false)
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Failed to process payment. Please try again.')
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Plan</h2>
          <p className="text-gray-600 mb-6">The selected plan is not available.</p>
          <Button onClick={() => router.push('/pricing')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
        </div>
      </div>
    )
  }

  const Icon = plan.icon

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">
            You're one step away from unlocking premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{plan.name} Plan</h2>
                <p className="text-gray-600">Monthly subscription</p>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.currency}{plan.price}
                </span>
                <span className="text-gray-600">/ {plan.period}</span>
              </div>
              <p className="text-sm text-gray-600">
                Billed monthly. Cancel anytime.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h3>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {processing && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  Processing your payment... Please wait.
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {plan.currency}{plan.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.currency}{plan.price}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handlePayment}
                disabled={loading || processing || !scriptLoaded}
                className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white"
              >
                {loading || !scriptLoaded ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secured by Razorpay. Your payment information is encrypted and secure.
              </p>
            </div>

            {/* Security Features */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Safe & Secure Payment
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  256-bit SSL encryption
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  PCI DSS compliant
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  Cancel anytime
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  14-day money-back guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
