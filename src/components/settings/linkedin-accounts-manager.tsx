'use client'

import { useState, useEffect } from 'react'
import { Linkedin, Plus, Star, Trash2, CheckCircle, AlertCircle, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface LinkedInAccount {
  id: string
  linkedin_user_id: string
  profile_name: string | null
  profile_headline: string | null
  profile_picture_url: string | null
  is_active: boolean
  is_primary: boolean
  last_synced_at: string | null
  created_at: string
}

interface LinkedInAccountsManagerProps {
  userPlan: string
  onUpgrade: () => void
}

export default function LinkedInAccountsManager({
  userPlan,
  onUpgrade,
}: LinkedInAccountsManagerProps) {
  const [accounts, setAccounts] = useState<LinkedInAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [limits, setLimits] = useState({ hasAccess: true, maxAccounts: 1 })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/linkedin/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])

        // Get plan limits
        const planLimits = {
          free: 1,
          pro: 5,
          standard: 10,
          custom: 999,
        }
        const maxAccounts = planLimits[userPlan.toLowerCase() as keyof typeof planLimits] || 1
        setLimits({ hasAccess: true, maxAccounts })
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to load LinkedIn accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (accounts.length >= limits.maxAccounts) {
      toast.error(`You've reached the limit of ${limits.maxAccounts} LinkedIn account(s) for your ${userPlan} plan.`)
      return
    }

    // Use Supabase's LinkedIn OAuth provider
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings&linkedin_connect=true`,
        scopes: 'openid profile email w_member_social'
      }
    })

    if (error) {
      console.error('LinkedIn OAuth error:', error)
      toast.error('Failed to connect LinkedIn. Please try again.')
    }
  }

  const handleSetPrimary = async (accountId: string) => {
    try {
      const response = await fetch(`/api/linkedin/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_primary' }),
      })

      if (response.ok) {
        toast.success('Primary account updated')
        fetchAccounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to set primary account')
      }
    } catch (error) {
      toast.error('Failed to set primary account')
    }
  }

  const handleRemoveAccount = async (accountId: string, isPrimary: boolean) => {
    if (isPrimary && accounts.length > 1) {
      toast.error('Please set another account as primary before removing this one')
      return
    }

    if (!confirm('Are you sure you want to remove this LinkedIn account?')) {
      return
    }

    try {
      const response = await fetch(`/api/linkedin/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Account removed successfully')
        fetchAccounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to remove account')
      }
    } catch (error) {
      toast.error('Failed to remove account')
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a66c2] to-blue-600 flex items-center justify-center shadow-sm">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">LinkedIn Accounts</h2>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a66c2] to-blue-600 flex items-center justify-center shadow-sm">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">LinkedIn Accounts</h2>
              <p className="text-xs text-gray-500">
                {accounts.length} of {limits.maxAccounts} account{limits.maxAccounts !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>

          {accounts.length < limits.maxAccounts && (
            <Button
              onClick={handleAddAccount}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          )}
        </div>
      </div>

      {/* Accounts List */}
      <div className="p-6">
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Linkedin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No LinkedIn Accounts</h3>
            <p className="text-gray-600 mb-4">
              Connect your LinkedIn account to start publishing posts
            </p>
            <Button
              onClick={handleAddAccount}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Connect LinkedIn
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  account.is_primary
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {account.profile_picture_url ? (
                      <img
                        src={account.profile_picture_url}
                        alt={account.profile_name || 'Profile'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {getInitials(account.profile_name)}
                      </div>
                    )}
                  </div>

                  {/* Account Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {account.profile_name || 'LinkedIn User'}
                      </h3>
                      {account.is_primary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          <Crown className="w-3 h-3" />
                          Primary
                        </span>
                      )}
                      <div title={account.is_active ? "Active" : "Inactive"}>
                        {account.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>

                    {account.profile_headline && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {account.profile_headline}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Connected {new Date(account.created_at).toLocaleDateString()}
                      </span>
                      {account.last_synced_at && (
                        <span>
                          Last synced {new Date(account.last_synced_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!account.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(account.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Set as primary"
                      >
                        <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveAccount(account.id, account.is_primary)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove account"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plan Limit Info */}
        {accounts.length >= limits.maxAccounts && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-1">
                  Account Limit Reached
                </h4>
                <p className="text-sm text-orange-800 mb-3">
                  You've reached the maximum of {limits.maxAccounts} LinkedIn account{limits.maxAccounts !== 1 ? 's' : ''} for
                  your {userPlan} plan. Upgrade to connect more accounts.
                </p>
                <Button
                  onClick={onUpgrade}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Pro Tip:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your primary account is used by default when creating new posts</li>
            <li>• You can switch accounts when creating or editing individual posts</li>
            <li>• Removing an account won't delete your existing posts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
