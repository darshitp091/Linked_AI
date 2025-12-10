'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Sparkles, Zap, Crown, Loader2, Star, MessageCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    features: [
      '5 posts per month',
      '5 AI generations',
      'Basic analytics',
      'Email support',
      'LinkedIn connection',
    ],
    buttonText: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹999',
    period: 'per month',
    description: 'For professionals',
    icon: Zap,
    color: 'from-[#0a66c2] to-blue-600',
    features: [
      '25 posts per month (5x Free)',
      '25 AI generations',
      'Advanced analytics',
      'Priority email support',
      'Custom scheduling',
      'LinkedIn analytics',
      'Post templates',
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹2,999',
    period: 'per month',
    description: 'For growing businesses',
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    features: [
      '100 posts per month (20x Free)',
      '100 AI generations',
      'Advanced analytics & insights',
      'Priority support (24/7)',
      'Custom scheduling',
      'LinkedIn analytics',
      'Post templates library',
      'Team collaboration (up to 3 users)',
      'Content calendar',
      'Engagement tracking',
    ],
    buttonText: 'Upgrade to Standard',
    popular: false,
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 'Contact Us',
    period: 'custom pricing',
    description: 'For enterprises & agencies',
    icon: Crown,
    color: 'from-orange-500 to-red-600',
    features: [
      'Custom posts limit',
      'Custom AI generations',
      'Dedicated account manager',
      '24/7 Priority support',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Unlimited team members',
      'API access',
      'White-label options',
      'Custom features on demand',
      'SLA guarantees',
      'Training & onboarding',
    ],
    buttonText: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single()

        if (subscription) {
          setCurrentPlan(subscription.plan)
        }
      }
    }
    fetchSubscription()
  }, [])

  // Check for success/error messages from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success) {
      toast.success(success)
      window.history.replaceState({}, '', '/pricing')
    }

    if (error) {
      toast.error(error)
      window.history.replaceState({}, '', '/pricing')
    }
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return

    // Custom plan requires contact form
    if (planId === 'custom') {
      setShowContactModal(true)
      return
    }

    setLoading(planId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to upgrade')
        setLoading(null)
        return
      }

      // Create Razorpay order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LinkedAI',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
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

          if (verifyResponse.ok) {
            toast.success('Payment successful! Plan upgraded.')
            setCurrentPlan(planId)
          } else {
            toast.error('Payment verification failed')
          }
          setLoading(null)
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#0a66c2',
        },
        modal: {
          ondismiss: function () {
            setLoading(null)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment')
      setLoading(null)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock powerful features and grow your LinkedIn presence with our flexible pricing plans
            </p>
          </div>

          {/* Pricing Cards - NEW PERFECTLY ALIGNED DESIGN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrentPlan = currentPlan === plan.id
              const isLoading = loading === plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular
                      ? 'border-[#0a66c2]'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Most Popular Badge - CENTERED */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                      <span className="bg-gradient-to-r from-[#0a66c2] to-blue-600 text-white px-5 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col h-full">
                    {/* Icon - CENTERED */}
                    <div className="flex justify-center mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Plan Name & Description - FIXED HEIGHT + CENTERED */}
                    <div className="text-center mb-5 h-20 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price - FIXED HEIGHT + CENTERED */}
                    <div className="text-center mb-5 pb-5 border-b-2 border-gray-100 h-24 flex flex-col justify-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {plan.price}
                      </div>
                      <div className="text-gray-500 text-xs">
                        /{plan.period}
                      </div>
                    </div>

                    {/* Features - FLEXIBLE HEIGHT */}
                    <ul className="space-y-2.5 mb-6 flex-grow text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button - FIXED AT BOTTOM */}
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan || isLoading || (plan.id !== 'free' && !razorpayLoaded)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-auto ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-r from-[#0a66c2] to-blue-600 hover:from-[#004182] hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                          : plan.id === 'custom'
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-[#0a66c2]'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        plan.buttonText
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Plan Comparison Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-[#0a66c2] to-blue-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white text-center">
                Detailed Plan Comparison
              </h2>
              <p className="text-blue-100 text-center mt-2 text-sm">
                Compare all features across plans
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 w-32">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-blue-50/80 w-32">
                      <div className="flex flex-col items-center gap-1">
                        Pro
                        <span className="text-[10px] bg-[#0a66c2] text-white px-2 py-0.5 rounded-full font-semibold">Popular</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 w-32">Standard</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 w-32">Custom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Posts per month</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 font-medium">5</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 bg-blue-50/50 font-medium">25<span className="text-xs text-[#0a66c2] ml-1">(5x)</span></td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 font-medium">100<span className="text-xs text-purple-600 ml-1">(20x)</span></td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 font-medium">Custom</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">AI Generations</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">5</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 bg-blue-50/50">25</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">100</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Custom</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">LinkedIn Connection</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Analytics</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Basic</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 bg-blue-50/50">Advanced</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Advanced + Insights</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Advanced + Reporting</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Support</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Email</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 bg-blue-50/50">Priority Email</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">24/7 Priority</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">24/7 Dedicated</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Custom Scheduling</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Post Templates</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Library Access</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Team Collaboration</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Up to 3 users</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">Unlimited</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">API Access</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">White-label Options</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">SLA Guarantee</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center bg-blue-50/50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300">
                    <td className="px-6 py-5 text-sm font-bold text-gray-900">Monthly Price</td>
                    <td className="px-6 py-5 text-center"><span className="text-xl font-bold text-gray-900">₹0</span></td>
                    <td className="px-6 py-5 text-center bg-blue-100/80"><span className="text-xl font-bold text-[#0a66c2]">₹999</span></td>
                    <td className="px-6 py-5 text-center"><span className="text-xl font-bold text-gray-900">₹2,999</span></td>
                    <td className="px-6 py-5 text-center"><span className="text-sm font-semibold text-orange-600">Contact Us</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600">
                  We offer a 7-day money-back guarantee. If you're not satisfied, contact support for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Modal for Custom Plan */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Contact Sales</h3>
                  <p className="text-sm text-gray-600">Get a custom plan tailored to your needs</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  Our custom plan is perfect for enterprises and agencies with specific requirements. Get in touch with our sales team to discuss:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom post limits and AI credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom integrations and features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Enterprise SLA and support</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <a
                  href="/contact"
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Sales Team
                </a>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
