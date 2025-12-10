import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitorId = params.id

    // Verify competitor belongs to user
    const { data: competitor, error: compError } = await supabase
      .from('competitor_accounts')
      .select('*')
      .eq('id', competitorId)
      .eq('user_id', user.id)
      .single()

    if (compError || !competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // In production, this would call LinkedIn API to fetch competitor's posts
    // For now, we'll return a success message
    // TODO: Integrate with LinkedIn API or scraping service

    const { error: updateError } = await supabase
      .from('competitor_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', competitorId)

    if (updateError) {
      console.error('Error updating sync time:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Competitor data sync initiated',
      note: 'LinkedIn API integration required for production use'
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
