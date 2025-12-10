'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 'Free',
    period: '',
    description: 'Perfect for getting started',
    postsPerMonth: '5 AI posts/month',
    linkedinAccounts: '1 LinkedIn account',
    features: [
      '5 AI-generated posts/month',
      '50 lead discoveries/week',
      '5 viral predictions/month',
      'Audience growth tracker',
      'Best time to post AI',
      '5 AI content ideas/week',
      'Basic post score (24h after)',
      'Trending topics access',
      '12+ post templates',
      'Basic scheduling',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For serious content creators',
    postsPerMonth: '100 AI posts/month',
    comparison: '20x more than Free',
    linkedinAccounts: '5 LinkedIn accounts',
    features: [
      '100 AI-generated posts/month',
      '500 lead discoveries/week',
      '100 viral predictions/month',
      'Audience growth + insights',
      'Track 3 competitors',
      'Top 10 engagers tracking',
      '20 AI comment replies/month',
      '20 AI content ideas/week',
      'Full post performance autopsy',
      'Advanced analytics dashboard',
      'A/B testing (2 variants)',
      'Priority support',
      'Custom hashtag suggestions',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Standard',
    price: '$79',
    period: '/month',
    description: 'For growing businesses',
    postsPerMonth: '500 AI posts/month',
    comparison: '100x more than Free',
    linkedinAccounts: '10 LinkedIn accounts',
    features: [
      '500 AI-generated posts/month',
      '2000 lead discoveries/week',
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
    cta: 'Start Free Trial',
    popular: false,
  },
]

const comparisonFeatures = [
  { name: 'Posts per month', free: '5', pro: '100', standard: '500' },
  { name: 'LinkedIn accounts', free: '1', pro: '5', standard: '10' },
  { name: 'AI-generated posts', free: true, pro: true, standard: true },
  { name: 'Lead Discovery', free: '50/week', pro: '500/week', standard: '2000/week' },
  { name: 'Viral Predictions', free: '5/month', pro: '100/month', standard: 'Unlimited' },
  { name: 'Competitor Tracking', free: false, pro: '3', standard: '10' },
  { name: 'Top Engagers', free: false, pro: 'Top 10', standard: 'Top 50' },
  { name: 'AI Comment Replies', free: false, pro: '20/month', standard: '100/month' },
  { name: 'Content Ideas', free: '5/week', pro: '20/week', standard: '50/week' },
  { name: 'Basic scheduling', free: true, pro: true, standard: true },
  { name: 'Email support', free: true, pro: true, standard: true },
  { name: 'Best time to post AI', free: true, pro: true, standard: true },
  { name: 'Audience growth tracker', free: true, pro: true, standard: true },
  { name: 'Trending topics access', free: true, pro: true, standard: true },
  { name: 'Basic analytics', free: true, pro: true, standard: true },
  { name: 'Advanced scheduling', free: false, pro: true, standard: true },
  { name: 'Analytics dashboard', free: false, pro: true, standard: true },
  { name: 'Multiple content styles', free: false, pro: true, standard: true },
  { name: 'Priority support', free: false, pro: true, standard: true },
  { name: 'Custom hashtag suggestions', free: false, pro: true, standard: true },
  { name: 'Post performance autopsy', free: false, pro: true, standard: true },
  { name: 'Team collaboration', free: false, pro: false, standard: '5 users' },
  { name: 'Content calendar', free: false, pro: false, standard: true },
  { name: 'A/B testing', free: false, pro: '2 variants', standard: '5 variants' },
  { name: 'Custom branding', free: false, pro: false, standard: true },
  { name: 'API access', free: false, pro: false, standard: true },
  { name: 'White-label reports', free: false, pro: false, standard: true },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your content needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 card-hover ${
                plan.popular
                  ? 'bg-white shadow-xl shadow-[#0a66c2]/10 border-2 border-[#0a66c2] scale-105 lg:scale-110'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0a66c2] text-white rounded-full text-sm font-medium whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 text-lg">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                {/* Key Metrics */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-[#0a66c2] mb-1">{plan.postsPerMonth}</div>
                  {plan.comparison && (
                    <div className="text-xs text-gray-500 mb-2">{plan.comparison}</div>
                  )}
                  <div className="text-sm font-semibold text-gray-700">{plan.linkedinAccounts}</div>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#057642] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.cta === 'Contact Us' ? '/contact' : '/signup'} className="mt-auto">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Comprehensive Comparison Table */}
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Detailed Plan Comparison
          </h3>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Features
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-[140px]">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-[140px] bg-[#0a66c2]/5">
                      <div className="flex flex-col items-center">
                        <span>Pro</span>
                        <span className="text-xs font-normal text-[#0a66c2] mt-1">Most Popular</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-[140px]">
                      Standard
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-[#057642] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{feature.free}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center bg-[#0a66c2]/5">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-[#057642] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{feature.pro}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.standard === 'boolean' ? (
                          feature.standard ? (
                            <Check className="w-5 h-5 text-[#057642] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{feature.standard}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
