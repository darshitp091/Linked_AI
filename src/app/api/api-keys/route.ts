import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createAPIKey,
  getUserAPIKeys,
  getAPIAccessLimits,
  API_SCOPES,
  APIScope,
} from '@/lib/api-keys'

/**
 * GET /api/api-keys
 * Get user's API keys
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keys = await getUserAPIKeys(user.id)

    // Get user's plan and limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const limits = getAPIAccessLimits(profile?.subscription_plan || 'free')

    return NextResponse.json({
      keys,
      limits,
      scopes: API_SCOPES,
    })
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyName, scopes, expiresInDays } = body

    // Validate input
    if (!keyName || !scopes || !Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json(
        { error: 'Key name and at least one scope are required' },
        { status: 400 }
      )
    }

    // Validate scopes
    const validScopes = Object.keys(API_SCOPES)
    const invalidScopes = scopes.filter((s: string) => !validScopes.includes(s))
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: `Invalid scopes: ${invalidScopes.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await createAPIKey({
      userId: user.id,
      keyName,
      scopes: scopes as APIScope[],
      expiresInDays,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      apiKey: result.apiKey,
      warning:
        'This is the only time you will see the full API key. Please save it securely.',
    })
  } catch (error: any) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    )
  }
}
