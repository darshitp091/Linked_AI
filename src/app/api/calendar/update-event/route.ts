import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCalendarEvent } from '@/lib/google-calendar/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, title, description, startTime, endTime } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Get user's Google Calendar settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_calendar_id')
      .eq('id', user.id)
      .single()

    const calendarId = profile?.google_calendar_id || 'primary'

    // Update calendar event
    await updateCalendarEvent(calendarId, eventId, {
      summary: title,
      description: description,
      start: startTime ? {
        dateTime: startTime,
        timeZone: 'UTC',
      } : undefined,
      end: endTime ? {
        dateTime: endTime,
        timeZone: 'UTC',
      } : undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Calendar event updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}
