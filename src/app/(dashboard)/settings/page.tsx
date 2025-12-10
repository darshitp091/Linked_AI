'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User, Linkedin, CreditCard, Save, Loader2, Settings as SettingsIcon, Bell, Shield, Palette, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import LinkedInAccountsManager from '@/components/settings/linkedin-accounts-manager'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setFullName(user.user_metadata?.full_name || '')

        // Fetch profile to check LinkedIn connection status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch subscription and usage data
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (subscriptionData) {
          setSubscription(subscriptionData)
        }
      }
    }
    getUser()
  }, [supabase.auth])

  // Check for success/error messages from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success) {
      toast.success(success)
      // Remove query params from URL
      window.history.replaceState({}, '', '/settings')
      // Refresh profile data
      const refreshProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
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
      }
      refreshProfile()
    }

    if (error) {
      toast.error(error)
      window.history.replaceState({}, '', '/settings')
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Settings saved!')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LinkedIn Accounts Manager */}
            <LinkedInAccountsManager
              userPlan={profile?.subscription_plan || 'free'}
              onUpgrade={() => router.push('/pricing')}
            />

            {/* Google Calendar Integration */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h10v2H7v-2z"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Google Calendar Sync</h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-gray-700 font-medium mb-3">
                    Automatically sync your scheduled LinkedIn posts to Google Calendar
                  </p>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h4>
                    <ul className="text-sm text-blue-800 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>When you schedule a LinkedIn post, a calendar event is created automatically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Events include post content preview and scheduled time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Get reminders 15 minutes before your post goes live</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Events update automatically if you reschedule</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Calendar Sync</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {profile?.google_calendar_enabled ? 'Events syncing to primary calendar' : 'Enable to create calendar events'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile?.google_calendar_enabled || false}
                        onChange={async (e) => {
                          const enabled = e.target.checked
                          const { error } = await supabase
                            .from('profiles')
                            .update({
                              google_calendar_enabled: enabled,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', user?.id)

                          if (error) {
                            toast.error('Failed to update calendar sync')
                          } else {
                            toast.success(enabled ? 'Calendar sync enabled' : 'Calendar sync disabled')
                            setProfile({ ...profile, google_calendar_enabled: enabled })
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {profile?.google_calendar_enabled && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Google Calendar sync is active. Your scheduled posts will appear in your calendar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription & Usage */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Subscription & Usage</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Plan Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
                  <div>
                    <p className="text-gray-700">
                      Current Plan: <span className="font-bold text-gray-900 capitalize">{subscription?.plan || 'Free'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {subscription?.plan === 'free' && 'Upgrade to unlock more features'}
                      {subscription?.plan === 'pro' && 'Pro features unlocked'}
                      {subscription?.plan === 'standard' && 'Standard features unlocked'}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
                  >
                    {subscription?.plan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
                  </button>
                </div>

                {/* AI Generation Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">AI Post Generation</span>
                    <span className="text-sm font-bold text-gray-900">
                      {subscription?.ai_generations_used || 0}/{subscription?.ai_generations_limit || 5}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((subscription?.ai_generations_used || 0) / (subscription?.ai_generations_limit || 5)) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(subscription?.ai_generations_limit || 5) - (subscription?.ai_generations_used || 0)} generations remaining this month
                  </p>
                </div>

                {/* Lead Discovery Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Lead Discovery</span>
                    <span className="text-sm font-bold text-gray-900">
                      {subscription?.leads_discovered_this_week || 0}/{
                        subscription?.plan === 'free' ? 10 :
                        subscription?.plan === 'pro' ? 125 :
                        subscription?.plan === 'standard' ? 500 : 10
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((subscription?.leads_discovered_this_week || 0) / (
                          subscription?.plan === 'free' ? 10 :
                          subscription?.plan === 'pro' ? 125 :
                          subscription?.plan === 'standard' ? 500 : 10
                        )) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Resets {subscription?.leads_week_reset_at ? new Date(subscription.leads_week_reset_at).toLocaleDateString() : 'weekly'}
                  </p>
                </div>

                {/* Viral Predictions Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Viral Predictions</span>
                    <span className="text-sm font-bold text-gray-900">
                      {subscription?.predictions_this_week || 0}/{subscription?.viral_predictions_limit || 3}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((subscription?.predictions_this_week || 0) / (subscription?.viral_predictions_limit || 3)) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(subscription?.viral_predictions_limit || 3) - (subscription?.predictions_this_week || 0)} predictions remaining this week
                  </p>
                </div>

                {/* Reset Date Info */}
                {subscription?.ai_generations_reset_at && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-600">
                      Monthly limits reset on {new Date(subscription.ai_generations_reset_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{fullName || 'User'}</h3>
                <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Member since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  Notifications
                </button>
                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  Privacy & Security
                </button>
                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-500" />
                  Appearance
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors text-left flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
