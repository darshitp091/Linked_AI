import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { addLinkedInAccount } from '@/lib/linkedin/accounts'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('[Auth Callback] Request params:', {
    hasCode: !!code,
    next,
    error,
    errorDescription,
    pathname: requestUrl.pathname
  })

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[Auth Callback] Exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
        )
      }

      console.log('[Auth Callback] Session exchanged successfully for user:', data.user?.email)

      // Check if this is a LinkedIn connection from settings (user already logged in)
      const linkedinConnect = requestUrl.searchParams.get('linkedin_connect')

      if (linkedinConnect === 'true' && next === '/settings') {
        console.log('[Auth Callback] LinkedIn account connection detected')

        // Check if user has LinkedIn identity
        const linkedinIdentity = data.user?.identities?.find(
          (identity: any) => identity.provider === 'linkedin_oidc'
        )

        if (linkedinIdentity) {
          console.log('[Auth Callback] LinkedIn identity:', {
            provider: linkedinIdentity.provider,
            id: linkedinIdentity.id,
            email: linkedinIdentity.identity_data?.email
          })

          // Store LinkedIn account in the database
          try {
            const result = await addLinkedInAccount({
              userId: data.user.id,
              linkedinUserId: linkedinIdentity.id,
              accessToken: data.session?.provider_token || '',
              refreshToken: data.session?.provider_refresh_token || undefined,
              profileName: linkedinIdentity.identity_data?.name || linkedinIdentity.identity_data?.full_name,
              profilePictureUrl: linkedinIdentity.identity_data?.picture || linkedinIdentity.identity_data?.avatar_url,
            })

            if (!result.success) {
              console.error('[Auth Callback] Failed to store LinkedIn account:', result.error)
              return NextResponse.redirect(
                new URL(`/settings?error=${encodeURIComponent(result.error || 'Failed to connect LinkedIn account')}`, request.url)
              )
            }

            console.log('[Auth Callback] LinkedIn account stored successfully')
            return NextResponse.redirect(
              new URL('/settings?success=LinkedIn account connected successfully!', request.url)
            )
          } catch (error: any) {
            console.error('[Auth Callback] Error storing LinkedIn account:', error)
            return NextResponse.redirect(
              new URL(`/settings?error=${encodeURIComponent('Failed to connect LinkedIn account')}`, request.url)
            )
          }
        }
      }

      // Check if this is an email confirmation (from manual signup)
      const isEmailConfirmation = next === '/login'

      if (isEmailConfirmation) {
        console.log('[Auth Callback] Email confirmation detected')
        return NextResponse.redirect(
          new URL('/login?success=Email confirmed! Please sign in to continue.', request.url)
        )
      }

      // Check if this is a LinkedIn signup/login (redirecting to dashboard)
      const isLinkedInAuth = data.user?.identities?.some(
        (identity: any) => identity.provider === 'linkedin_oidc'
      )

      if (isLinkedInAuth && next === '/dashboard') {
        console.log('[Auth Callback] LinkedIn signup/login detected')

        // Get the LinkedIn identity
        const linkedinIdentity = data.user?.identities?.find(
          (identity: any) => identity.provider === 'linkedin_oidc'
        )

        if (linkedinIdentity) {
          // Check if this LinkedIn account is already in our database
          const supabase = await createClient()
          const { data: existingAccount } = await supabase
            .from('linkedin_accounts')
            .select('id')
            .eq('user_id', data.user.id)
            .eq('linkedin_user_id', linkedinIdentity.id)
            .maybeSingle()

          // If not already stored, add it
          if (!existingAccount) {
            console.log('[Auth Callback] Storing LinkedIn account for new user')
            try {
              await addLinkedInAccount({
                userId: data.user.id,
                linkedinUserId: linkedinIdentity.id,
                accessToken: data.session?.provider_token || '',
                refreshToken: data.session?.provider_refresh_token || undefined,
                profileName: linkedinIdentity.identity_data?.name || linkedinIdentity.identity_data?.full_name,
                profilePictureUrl: linkedinIdentity.identity_data?.picture || linkedinIdentity.identity_data?.avatar_url,
                isPrimary: true, // Make it primary for new signups
              })
              console.log('[Auth Callback] LinkedIn account stored for signup/login')
            } catch (error) {
              console.error('[Auth Callback] Error storing LinkedIn account:', error)
              // Don't block the login if storing fails
            }
          }
        }
      }

      // Determine redirect based on 'next' parameter
      // All successful authentications go to their specified destination or dashboard
      const redirectPath = next || '/dashboard'

      console.log('[Auth Callback] Redirecting to:', redirectPath)
      return NextResponse.redirect(new URL(redirectPath, request.url))

    } catch (err) {
      console.error('[Auth Callback] Unexpected error:', err)
      return NextResponse.redirect(
        new URL('/login?error=Authentication failed', request.url)
      )
    }
  }

  // No code provided - redirect to login
  console.warn('[Auth Callback] No code provided')
  return NextResponse.redirect(new URL('/login', request.url))
}
