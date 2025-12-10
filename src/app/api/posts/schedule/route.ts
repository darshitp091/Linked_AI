import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, scheduledFor, syncToGoogleCalendar } = await request.json()

    if (!postId || !scheduledFor) {
      return NextResponse.json(
        { error: 'Post ID and scheduled time are required' },
        { status: 400 }
      )
    }

    // Validate that scheduled time is in the future
    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Check if LinkedIn is connected
    const { data: profile } = await supabase
      .from('profiles')
      .select('linkedin_connected')
      .eq('id', user.id)
      .single()

    if (!profile?.linkedin_connected) {
      return NextResponse.json(
        { error: 'Please connect your LinkedIn account first to schedule posts' },
        { status: 400 }
      )
    }

    // Update post with scheduled information
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'scheduled',
        scheduled_for: scheduledDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating post:', updateError)
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      )
    }

    // If sync to Google Calendar is enabled, create calendar event
    let googleCalendarEventId = null
    if (syncToGoogleCalendar) {
      try {
        const calendarResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/create-event`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postId: post.id,
              title: `📱 LinkedIn Post: ${post.topic || 'Untitled'}`,
              description: post.content,
              startTime: scheduledDate.toISOString(),
              endTime: new Date(scheduledDate.getTime() + 15 * 60000).toISOString(), // 15 min event
            }),
          }
        )

        if (calendarResponse.ok) {
          const { eventId } = await calendarResponse.json()
          googleCalendarEventId = eventId

          // Update post with Google Calendar event ID
          await supabase
            .from('posts')
            .update({
              google_calendar_event_id: eventId,
            })
            .eq('id', postId)
        }
      } catch (calendarError) {
        console.error('Error creating calendar event:', calendarError)
        // Don't fail the whole request if calendar sync fails
      }
    }

    // Log activity
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: 'post_scheduled',
      activity_data: {
        post_id: postId,
        scheduled_for: scheduledDate.toISOString(),
        synced_to_calendar: !!googleCalendarEventId
      },
    })

    return NextResponse.json({
      success: true,
      post,
      googleCalendarEventId,
      message: 'Post scheduled successfully',
    })
  } catch (error: any) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
