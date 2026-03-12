import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listId = params.id
    const { lead_id } = await request.json()

    if (!lead_id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('lead_list_members')
      .insert({
        lead_list_id: listId,
        lead_id: lead_id
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Lead is already in this list' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to add lead to list' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
