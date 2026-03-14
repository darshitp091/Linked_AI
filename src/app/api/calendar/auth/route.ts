import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleOAuth2Client } from '@/lib/google-calendar/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oauth2Client = getGoogleOAuth2Client()
    
    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Critical for refresh token
      prompt: 'consent',      // Force consent to ensure refresh token is returned
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      state: user.id // Pass user ID to match in callback
    })

    return NextResponse.json({ url: authUrl })
  } catch (error: any) {
    console.error('[Google Calendar Auth] Setup error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
