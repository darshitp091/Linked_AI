'use client'

import Link from 'next/link'
import { getUpgradeMessage } from '@/lib/ab-testing/plan-limits'

interface UpgradePromptProps {
  currentPlan: string
  message?: string
}

export default function UpgradePrompt({ currentPlan, message }: UpgradePromptProps) {
  const defaultMessage = message || getUpgradeMessage(currentPlan as any)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          A/B Testing Not Available
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {defaultMessage}
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-200">
          <h3 className="text-xl font-semibold mb-4">
            What you get with A/B Testing:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold">Test Multiple Variants</h4>
                <p className="text-sm text-gray-600">
                  Create 2-5 different versions of your posts
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold">Statistical Analysis</h4>
                <p className="text-sm text-gray-600">
                  Get data-driven insights on what works best
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-semibold">Auto-Promote Winner</h4>
                <p className="text-sm text-gray-600">
                  Automatically promote best-performing content
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📈</div>
              <div>
                <h4 className="font-semibold">Performance Tracking</h4>
                <p className="text-sm text-gray-600">
                  Real-time metrics and engagement analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Pricing Plans
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-semibold text-center mb-6">
          A/B Testing Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Feature</th>
                <th className="text-center py-3 px-4">Free/Pro</th>
                <th className="text-center py-3 px-4">Standard</th>
                <th className="text-center py-3 px-4">Custom/Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-3 px-4">A/B Testing</td>
                <td className="text-center py-3 px-4 text-red-600">✗</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Max Variants</td>
                <td className="text-center py-3 px-4">-</td>
                <td className="text-center py-3 px-4">3</td>
                <td className="text-center py-3 px-4">5</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Active Tests</td>
                <td className="text-center py-3 px-4">-</td>
                <td className="text-center py-3 px-4">5</td>
                <td className="text-center py-3 px-4">10+</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Auto-Promote Winner</td>
                <td className="text-center py-3 px-4 text-red-600">✗</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Advanced Analytics</td>
                <td className="text-center py-3 px-4 text-red-600">✗</td>
                <td className="text-center py-3 px-4 text-red-600">✗</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
