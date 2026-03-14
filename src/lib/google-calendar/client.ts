import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

export interface CalendarEvent {
  id?: string
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`

export function getGoogleOAuth2Client() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar credentials are not configured')
  }

  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)
}

export async function getAuthorizedCalendarClient(userId: string) {
  const supabase = await createClient()
  
  // Get tokens from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', userId)
    .single()

  if (error || !profile?.google_refresh_token) {
    throw new Error('Google Calendar is not connected')
  }

  const oauth2Client = getGoogleOAuth2Client()
  
  oauth2Client.setCredentials({
    access_token: profile.google_access_token,
    refresh_token: profile.google_refresh_token,
    expiry_date: profile.google_token_expiry ? new Date(profile.google_token_expiry).getTime() : undefined
  })

  // Check if token is expired and refresh if necessary
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      // Store new tokens
      await supabase
        .from('profiles')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    } else if (tokens.access_token) {
      await supabase
        .from('profiles')
        .update({
          google_access_token: tokens.access_token,
          google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

export async function createCalendarEvent(
  userId: string,
  calendarId: string,
  event: CalendarEvent
): Promise<string> {
  try {
    const calendar = await getAuthorizedCalendarClient(userId)

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        reminders: event.reminders || {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'email', minutes: 30 },
          ],
        },
      },
    })

    if (!response.data.id) {
      throw new Error('Failed to create calendar event')
    }

    return response.data.id
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    throw new Error(`Failed to create calendar event: ${error.message}`)
  }
}

export async function updateCalendarEvent(
  userId: string,
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<void> {
  try {
    const calendar = await getAuthorizedCalendarClient(userId)

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
      },
    })
  } catch (error: any) {
    console.error('Error updating calendar event:', error)
    throw new Error(`Failed to update calendar event: ${error.message}`)
  }
}

export async function deleteCalendarEvent(
  userId: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = await getAuthorizedCalendarClient(userId)

    await calendar.events.delete({
      calendarId,
      eventId,
    })
  } catch (error: any) {
    console.error('Error deleting calendar event:', error)
    throw new Error(`Failed to delete calendar event: ${error.message}`)
  }
}

export async function listUserCalendars(userId: string): Promise<Array<{ id: string; summary: string }>> {
  try {
    const calendar = await getAuthorizedCalendarClient(userId)

    const response = await calendar.calendarList.list()

    if (!response.data.items) {
      return []
    }

    return response.data.items.map((item) => ({
      id: item.id || '',
      summary: item.summary || 'Unnamed Calendar',
    }))
  } catch (error: any) {
    console.error('Error listing calendars:', error)
    throw new Error(`Failed to list calendars: ${error.message}`)
  }
}
