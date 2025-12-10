/**
 * API Key Management System
 * Allows users to generate and manage API keys for programmatic access
 */

import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export interface APIKey {
  id: string
  user_id: string
  key_name: string
  key_prefix: string
  key_hash: string
  scopes: string[]
  last_used_at?: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface APIKeyWithSecret {
  id: string
  key_name: string
  api_key: string // Full key (only returned once)
  scopes: string[]
  expires_at?: string
}

/**
 * Available API scopes
 */
export const API_SCOPES = {
  'posts:read': 'Read posts',
  'posts:write': 'Create and update posts',
  'posts:delete': 'Delete posts',
  'analytics:read': 'Read analytics data',
  'schedule:write': 'Schedule posts',
  'drafts:read': 'Read drafts',
  'drafts:write': 'Create and update drafts',
} as const

export type APIScope = keyof typeof API_SCOPES

/**
 * Plan-based API access limits
 */
export function getAPIAccessLimits(plan: string): {
  hasAccess: boolean
  maxKeys: number
  rateLimit: number // requests per hour
} {
  const limits = {
    free: { hasAccess: false, maxKeys: 0, rateLimit: 0 },
    pro: { hasAccess: false, maxKeys: 0, rateLimit: 0 },
    standard: { hasAccess: true, maxKeys: 3, rateLimit: 1000 },
    custom: { hasAccess: true, maxKeys: 10, rateLimit: 5000 },
  }

  return limits[plan.toLowerCase() as keyof typeof limits] || limits.free
}

/**
 * Generate a secure API key
 */
function generateAPIKey(): { key: string; prefix: string; hash: string } {
  // Generate random key: ll_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  const randomBytes = crypto.randomBytes(32)
  const key = `ll_${randomBytes.toString('hex')}`

  // Prefix for identification (first 10 chars)
  const prefix = key.substring(0, 10)

  // Hash for storage
  const hash = crypto.createHash('sha256').update(key).digest('hex')

  return { key, prefix, hash }
}

/**
 * Create a new API key
 */
export async function createAPIKey(params: {
  userId: string
  keyName: string
  scopes: APIScope[]
  expiresInDays?: number
}): Promise<{ success: boolean; apiKey?: APIKeyWithSecret; error?: string }> {
  const supabase = createAdminClient()

  // Check user's plan and limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', params.userId)
    .single()

  if (!profile) {
    return { success: false, error: 'User profile not found' }
  }

  const limits = getAPIAccessLimits(profile.subscription_plan)

  if (!limits.hasAccess) {
    return {
      success: false,
      error: 'API access is only available on Standard and Custom plans. Please upgrade.',
    }
  }

  // Check current key count
  const { count } = await supabase
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', params.userId)
    .eq('is_active', true)

  if (count && count >= limits.maxKeys) {
    return {
      success: false,
      error: `You've reached the maximum of ${limits.maxKeys} active API keys for your plan.`,
    }
  }

  // Generate key
  const { key, prefix, hash } = generateAPIKey()

  // Calculate expiration
  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  // Store in database
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: params.userId,
      key_name: params.keyName,
      key_prefix: prefix,
      key_hash: hash,
      scopes: params.scopes,
      expires_at: expiresAt,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating API key:', error)
    return { success: false, error: 'Failed to create API key' }
  }

  return {
    success: true,
    apiKey: {
      id: data.id,
      key_name: data.key_name,
      api_key: key, // Only returned once!
      scopes: data.scopes,
      expires_at: data.expires_at,
    },
  }
}

/**
 * Get user's API keys (without full key)
 */
export async function getUserAPIKeys(userId: string): Promise<APIKey[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching API keys:', error)
    return []
  }

  return data || []
}

/**
 * Verify an API key and return user ID
 */
export async function verifyAPIKey(
  apiKey: string
): Promise<{ valid: boolean; userId?: string; scopes?: string[]; error?: string }> {
  const supabase = createAdminClient()

  // Hash the provided key
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex')

  // Look up the key
  const { data, error } = await supabase
    .from('api_keys')
    .select('user_id, scopes, expires_at, is_active')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    return { valid: false, error: 'Invalid API key' }
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' }
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', hash)

  return {
    valid: true,
    userId: data.user_id,
    scopes: data.scopes,
  }
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeAPIKey(
  keyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error revoking API key:', error)
    return { success: false, error: 'Failed to revoke API key' }
  }

  return { success: true }
}

/**
 * Delete an API key permanently
 */
export async function deleteAPIKey(
  keyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting API key:', error)
    return { success: false, error: 'Failed to delete API key' }
  }

  return { success: true }
}

/**
 * Check if user has specific scope
 */
export function hasScope(userScopes: string[], requiredScope: string): boolean {
  return userScopes.includes(requiredScope)
}

/**
 * Middleware to verify API key from request header
 */
export async function verifyAPIKeyFromHeader(
  authHeader: string | null
): Promise<{ valid: boolean; userId?: string; scopes?: string[]; error?: string }> {
  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' }
  }

  // Expected format: "Bearer ll_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { valid: false, error: 'Invalid Authorization header format' }
  }

  const apiKey = parts[1]

  if (!apiKey.startsWith('ll_')) {
    return { valid: false, error: 'Invalid API key format' }
  }

  return await verifyAPIKey(apiKey)
}

/**
 * Log API usage
 */
export async function logAPIUsage(params: {
  userId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
}): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('api_usage_logs').insert({
    user_id: params.userId,
    endpoint: params.endpoint,
    method: params.method,
    status_code: params.statusCode,
    response_time_ms: params.responseTime,
  })
}
