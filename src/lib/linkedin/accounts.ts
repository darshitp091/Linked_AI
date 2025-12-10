/**
 * LinkedIn Accounts Management
 * Handles multiple LinkedIn account connections per user
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export interface LinkedInAccount {
  id: string
  user_id: string
  linkedin_user_id: string
  linkedin_access_token: string
  linkedin_refresh_token?: string
  linkedin_token_expires_at?: string
  linkedin_profile_url?: string
  profile_name?: string
  profile_headline?: string
  profile_picture_url?: string
  is_active: boolean
  is_primary: boolean
  last_synced_at?: string
  created_at: string
  updated_at: string
}

/**
 * Get account limit based on subscription plan
 */
export function getLinkedInAccountLimit(plan: string): number {
  const limits: Record<string, number> = {
    free: 1,
    pro: 5,
    standard: 10,
    custom: 999, // Effectively unlimited
  }

  return limits[plan.toLowerCase()] || 1
}

/**
 * Get all LinkedIn accounts for a user
 */
export async function getUserLinkedInAccounts(
  userId: string,
  activeOnly = false
): Promise<LinkedInAccount[]> {
  const supabase = await createClient()

  let query = supabase
    .from('linkedin_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching LinkedIn accounts:', error)
    throw new Error('Failed to fetch LinkedIn accounts')
  }

  return data || []
}

/**
 * Get primary LinkedIn account for a user
 */
export async function getPrimaryLinkedInAccount(
  userId: string
): Promise<LinkedInAccount | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('linkedin_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_primary', true)
    .maybeSingle()

  if (error) {
    console.error('Error fetching primary LinkedIn account:', error)
    return null
  }

  return data
}

/**
 * Get a specific LinkedIn account by ID
 */
export async function getLinkedInAccountById(
  accountId: string
): Promise<LinkedInAccount | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('linkedin_accounts')
    .select('*')
    .eq('id', accountId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching LinkedIn account:', error)
    return null
  }

  return data
}

/**
 * Add a new LinkedIn account for a user
 */
export async function addLinkedInAccount(params: {
  userId: string
  linkedinUserId: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: string
  profileUrl?: string
  profileName?: string
  profileHeadline?: string
  profilePictureUrl?: string
  isPrimary?: boolean
}): Promise<{ success: boolean; account?: LinkedInAccount; error?: string }> {
  const supabase = await createClient()

  // Check current account count and limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, linkedin_accounts_limit')
    .eq('id', params.userId)
    .single()

  if (!profile) {
    return { success: false, error: 'User profile not found' }
  }

  const { data: existingAccounts } = await supabase
    .from('linkedin_accounts')
    .select('id')
    .eq('user_id', params.userId)
    .eq('is_active', true)

  const currentCount = existingAccounts?.length || 0
  const limit = profile.linkedin_accounts_limit || 1

  if (currentCount >= limit) {
    return {
      success: false,
      error: `LinkedIn account limit reached. Your ${profile.subscription_plan} plan allows ${limit} account(s). Please upgrade to add more accounts.`,
    }
  }

  // Check if this LinkedIn account is already connected
  const { data: duplicate } = await supabase
    .from('linkedin_accounts')
    .select('id')
    .eq('user_id', params.userId)
    .eq('linkedin_user_id', params.linkedinUserId)
    .maybeSingle()

  if (duplicate) {
    return {
      success: false,
      error: 'This LinkedIn account is already connected',
    }
  }

  // If this is the first account, make it primary
  const isPrimary = currentCount === 0 ? true : params.isPrimary || false

  // Insert new account
  const { data, error } = await supabase
    .from('linkedin_accounts')
    .insert({
      user_id: params.userId,
      linkedin_user_id: params.linkedinUserId,
      linkedin_access_token: params.accessToken,
      linkedin_refresh_token: params.refreshToken,
      linkedin_token_expires_at: params.tokenExpiresAt,
      linkedin_profile_url: params.profileUrl,
      profile_name: params.profileName,
      profile_headline: params.profileHeadline,
      profile_picture_url: params.profilePictureUrl,
      is_active: true,
      is_primary: isPrimary,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding LinkedIn account:', error)
    return { success: false, error: 'Failed to add LinkedIn account' }
  }

  // Update profile's linkedin_connected flag
  await supabase
    .from('profiles')
    .update({ linkedin_connected: true })
    .eq('id', params.userId)

  return { success: true, account: data }
}

/**
 * Update a LinkedIn account
 */
export async function updateLinkedInAccount(
  accountId: string,
  updates: Partial<LinkedInAccount>
): Promise<{ success: boolean; account?: LinkedInAccount; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('linkedin_accounts')
    .update(updates)
    .eq('id', accountId)
    .select()
    .single()

  if (error) {
    console.error('Error updating LinkedIn account:', error)
    return { success: false, error: 'Failed to update LinkedIn account' }
  }

  return { success: true, account: data }
}

/**
 * Set an account as primary
 */
export async function setPrimaryLinkedInAccount(
  accountId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // The trigger will automatically unset other primary accounts
  const { error } = await supabase
    .from('linkedin_accounts')
    .update({ is_primary: true })
    .eq('id', accountId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error setting primary account:', error)
    return { success: false, error: 'Failed to set primary account' }
  }

  return { success: true }
}

/**
 * Deactivate a LinkedIn account (soft delete)
 */
export async function deactivateLinkedInAccount(
  accountId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Check if this is the primary account
  const { data: account } = await supabase
    .from('linkedin_accounts')
    .select('is_primary')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single()

  if (!account) {
    return { success: false, error: 'Account not found' }
  }

  // If primary, set another account as primary first
  if (account.is_primary) {
    const { data: otherAccounts } = await supabase
      .from('linkedin_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .neq('id', accountId)
      .limit(1)

    if (otherAccounts && otherAccounts.length > 0) {
      await setPrimaryLinkedInAccount(otherAccounts[0].id, userId)
    }
  }

  // Deactivate the account
  const { error } = await supabase
    .from('linkedin_accounts')
    .update({ is_active: false })
    .eq('id', accountId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deactivating LinkedIn account:', error)
    return { success: false, error: 'Failed to deactivate account' }
  }

  // Check if there are any active accounts left
  const { data: remainingAccounts } = await supabase
    .from('linkedin_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)

  // If no active accounts, update profile
  if (!remainingAccounts || remainingAccounts.length === 0) {
    await supabase
      .from('profiles')
      .update({ linkedin_connected: false })
      .eq('id', userId)
  }

  return { success: true }
}

/**
 * Delete a LinkedIn account permanently
 */
export async function deleteLinkedInAccount(
  accountId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('linkedin_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting LinkedIn account:', error)
    return { success: false, error: 'Failed to delete account' }
  }

  return { success: true }
}

/**
 * Update account limit based on subscription plan
 * Called when user upgrades/downgrades their plan
 */
export async function updateAccountLimit(
  userId: string,
  plan: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  const newLimit = getLinkedInAccountLimit(plan)

  const { error } = await supabase
    .from('profiles')
    .update({ linkedin_accounts_limit: newLimit })
    .eq('id', userId)

  if (error) {
    console.error('Error updating account limit:', error)
    return { success: false, error: 'Failed to update account limit' }
  }

  return { success: true }
}

/**
 * Refresh LinkedIn access token
 */
export async function refreshLinkedInToken(
  accountId: string
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  const supabase = await createClient()

  const { data: account } = await supabase
    .from('linkedin_accounts')
    .select('linkedin_refresh_token')
    .eq('id', accountId)
    .single()

  if (!account?.linkedin_refresh_token) {
    return { success: false, error: 'No refresh token available' }
  }

  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.linkedin_refresh_token,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()

    // Update the account with new token
    await supabase
      .from('linkedin_accounts')
      .update({
        linkedin_access_token: data.access_token,
        linkedin_token_expires_at: new Date(
          Date.now() + data.expires_in * 1000
        ).toISOString(),
      })
      .eq('id', accountId)

    return { success: true, accessToken: data.access_token }
  } catch (error: any) {
    console.error('Error refreshing token:', error)
    return { success: false, error: error.message }
  }
}
