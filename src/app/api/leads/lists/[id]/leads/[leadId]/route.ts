import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, leadId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listId, leadId } = params

    const { error } = await supabase
      .from('lead_list_members')
      .delete()
      .eq('lead_list_id', listId)
      .eq('lead_id', leadId)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove lead from list' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
