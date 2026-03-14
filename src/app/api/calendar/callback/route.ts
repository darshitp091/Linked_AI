import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleOAuth2Client } from '@/lib/google-calendar/client'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const userId = requestUrl.searchParams.get('state') // We passed user ID in 'state'
  const error = requestUrl.searchParams.get('error')

  if (error) {
    console.error('[Google Calendar Callback] OAuth error:', error)
    return NextResponse.redirect(new URL('/settings?error=Google Calendar access denied', request.url))
  }

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/settings?error=Invalid callback request', request.url))
  }

  try {
    const oauth2Client = getGoogleOAuth2Client()
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens.refresh_token) {
      console.warn('[Google Calendar Callback] No refresh token returned. User might need to re-consent.')
    }

    // Initialize Supabase
    const supabase = await createClient()

    // Store tokens in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token || undefined, // Keep existing if not returned
        google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        google_calendar_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[Google Calendar Callback] Database update error:', updateError)
      return NextResponse.redirect(new URL('/settings?error=Failed to save calendar tokens', request.url))
    }

    console.log('[Google Calendar Callback] Tokens stored successfully for user:', userId)
    return NextResponse.redirect(new URL('/settings?success=Google Calendar connected successfully!', request.url))

  } catch (err: any) {
    console.error('[Google Calendar Callback] Unexpected error:', err)
    return NextResponse.redirect(new URL('/settings?error=Authentication failed', request.url))
  }
}
