import { google } from 'googleapis'

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

export function getGoogleCalendarClient() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY

  if (!apiKey || apiKey === 'your_google_calendar_api_key_here') {
    throw new Error('Google Calendar API key is not configured')
  }

  const calendar = google.calendar({
    version: 'v3',
    auth: apiKey,
  })

  return calendar
}

export async function createCalendarEvent(
  calendarId: string,
  event: CalendarEvent
): Promise<string> {
  try {
    const calendar = getGoogleCalendarClient()

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
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<void> {
  try {
    const calendar = getGoogleCalendarClient()

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
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = getGoogleCalendarClient()

    await calendar.events.delete({
      calendarId,
      eventId,
    })
  } catch (error: any) {
    console.error('Error deleting calendar event:', error)
    throw new Error(`Failed to delete calendar event: ${error.message}`)
  }
}

export async function listUserCalendars(): Promise<Array<{ id: string; summary: string }>> {
  try {
    const calendar = getGoogleCalendarClient()

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
