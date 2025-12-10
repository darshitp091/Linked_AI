import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCalendarEvent } from '@/lib/google-calendar/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, title, description, startTime, endTime } = await request.json()

    if (!postId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's Google Calendar settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_calendar_id, google_calendar_enabled')
      .eq('id', user.id)
      .single()

    if (!profile?.google_calendar_enabled) {
      return NextResponse.json(
        { error: 'Google Calendar integration is not enabled' },
        { status: 400 }
      )
    }

    const calendarId = profile.google_calendar_id || 'primary'

    // Create calendar event
    const eventId = await createCalendarEvent(calendarId, {
      summary: title,
      description: `${description}\n\n📱 This post will be automatically published to LinkedIn at the scheduled time.\n\nView and edit: ${process.env.NEXT_PUBLIC_APP_URL}/scheduled`,
      start: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'email', minutes: 30 },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      eventId,
      message: 'Calendar event created successfully',
    })
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
