import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // If there's an auth code in the URL and we're not already on the callback route
  // All Supabase OAuth (LinkedIn, Google, email confirmation, password reset) uses /auth/callback
  if (code && !requestUrl.pathname.startsWith('/auth/callback')) {
    // Redirect Supabase auth codes to callback handler
    // The callback handler will determine the final destination based on 'next' param
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)

    // Preserve all query parameters
    const nextParam = requestUrl.searchParams.get('next')
    const linkedinConnect = requestUrl.searchParams.get('linkedin_connect')

    if (nextParam) {
      callbackUrl.searchParams.set('next', nextParam)
    }
    if (linkedinConnect) {
      callbackUrl.searchParams.set('linkedin_connect', linkedinConnect)
    }

    console.log('[Middleware] Redirecting to callback:', {
      from: requestUrl.pathname,
      to: callbackUrl.pathname,
      next: nextParam,
      linkedinConnect
    })

    return NextResponse.redirect(callbackUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
