import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTicketData } from '@/types/support'

// GET /api/support/tickets - List user's tickets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tickets,
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST /api/support/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateTicketData = await request.json()
    const { subject, description, category, priority = 'medium' } = body

    // Validate required fields
    if (!subject || !description || !category) {
      return NextResponse.json(
        { error: 'Subject, description, and category are required' },
        { status: 400 }
      )
    }

    // Get user's subscription plan to determine support priority
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const userPlan = profile?.subscription_plan || 'free'

    // Auto-adjust priority based on plan for urgent requests
    let finalPriority = priority
    if (priority === 'urgent' && userPlan === 'free') {
      // Free users can't create urgent tickets, downgrade to high
      finalPriority = 'high'
    }

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject,
        description,
        category,
        priority: finalPriority,
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    // Log notification (in production, send email)
    console.log(`[SUPPORT] New ticket created: ${ticket.id} by user ${user.id}`)
    console.log(`[EMAIL] Would send confirmation to ${user.email}`)

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Support ticket created successfully',
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
