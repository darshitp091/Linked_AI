import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Fetch all lead lists
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lists, error } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching lead lists:', error)
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
    }

    return NextResponse.json({ lists })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new lead list
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: list, error } = await supabase
      .from('lead_lists')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead list:', error)
      return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })
    }

    // Add leads to list if provided
    if (body.lead_ids && body.lead_ids.length > 0) {
      const membersToInsert = body.lead_ids.map((leadId: string) => ({
        lead_list_id: list.id,
        lead_id: leadId
      }))

      await supabase
        .from('lead_list_members')
        .insert(membersToInsert)
    }

    return NextResponse.json({ list, message: 'Lead list created successfully' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Add/remove leads from list
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { list_id, add_lead_ids = [], remove_lead_ids = [] } = body

    // Verify list belongs to user
    const { data: list } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('id', list_id)
      .eq('user_id', user.id)
      .single()

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Add leads
    if (add_lead_ids.length > 0) {
      const membersToInsert = add_lead_ids.map((leadId: string) => ({
        lead_list_id: list_id,
        lead_id: leadId
      }))

      await supabase
        .from('lead_list_members')
        .insert(membersToInsert)
    }

    // Remove leads
    if (remove_lead_ids.length > 0) {
      await supabase
        .from('lead_list_members')
        .delete()
        .eq('lead_list_id', list_id)
        .in('lead_id', remove_lead_ids)
    }

    return NextResponse.json({
      success: true,
      added: add_lead_ids.length,
      removed: remove_lead_ids.length
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
