import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateTicketData } from '@/types/support'

// GET /api/support/tickets/[id] - Get specific ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

// PATCH /api/support/tickets/[id] - Update ticket status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateTicketData = await request.json()
    const { status, priority } = body

    // Verify ticket ownership
    const { data: existingTicket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status !== undefined) {
      updateData.status = status

      // If status is resolved or closed, set resolved_at
      if ((status === 'resolved' || status === 'closed') && !existingTicket.resolved_at) {
        updateData.resolved_at = new Date().toISOString()
      }
    }

    if (priority !== undefined) {
      updateData.priority = priority
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json(
        { error: 'Failed to update ticket' },
        { status: 500 }
      )
    }

    // Log notification
    console.log(`[SUPPORT] Ticket ${id} updated by user ${user.id}`)
    if (status) {
      console.log(`[EMAIL] Would send status update notification for ticket ${id}`)
    }

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

// DELETE /api/support/tickets/[id] - Delete ticket (optional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting ticket:', error)
      return NextResponse.json(
        { error: 'Failed to delete ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
