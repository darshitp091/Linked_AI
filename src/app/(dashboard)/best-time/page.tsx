'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BestTimeWidget from '@/components/analytics/best-time-widget'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BestTimePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Best Time to Post
          </h1>
          <p className="text-gray-600">
            Discover when your audience is most engaged and optimize your posting schedule
          </p>
        </div>

        {/* Best Time Widget */}
        <BestTimeWidget
          userPlan={profile?.subscription_plan || 'free'}
          onUpgrade={handleUpgrade}
        />

        {/* Additional Information */}
        {profile?.subscription_plan &&
          ['pro', 'standard', 'custom'].includes(
            profile.subscription_plan.toLowerCase()
          ) && (
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                How It Works
              </h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Historical Analysis
                    </h4>
                    <p className="text-gray-600">
                      We analyze your past posts to identify patterns in engagement
                      across different days and times.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      AI-Powered Insights
                    </h4>
                    <p className="text-gray-600">
                      Our AI (powered by Google Gemini) generates personalized
                      recommendations based on your unique audience behavior.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Continuous Improvement
                    </h4>
                    <p className="text-gray-600">
                      As you publish more posts, our recommendations become more
                      accurate and tailored to your specific audience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">💡 Pro Tip:</span> For the most
                  accurate recommendations, publish at least 10-20 posts across
                  different days and times. This gives our AI enough data to identify
                  your audience's true engagement patterns.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
