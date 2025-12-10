import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: List all competitors
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: competitors, error } = await supabase
      .from('competitor_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching competitors:', error)
      return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 })
    }

    return NextResponse.json({ competitors })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Add new competitor
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check competitor tracking limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, competitor_tracking_limit')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.competitor_tracking_limit === 0) {
      return NextResponse.json({
        error: 'Competitor tracking not available in your plan',
        upgrade_required: true
      }, { status: 403 })
    }

    // Check current count
    const { count } = await supabase
      .from('competitor_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count || 0) >= subscription.competitor_tracking_limit) {
      return NextResponse.json({
        error: 'Competitor tracking limit reached',
        limit: subscription.competitor_tracking_limit,
        current: count
      }, { status: 429 })
    }

    const body = await request.json()

    // Validate LinkedIn URL
    if (!body.linkedin_url || !body.linkedin_url.includes('linkedin.com')) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }

    // Create competitor
    const { data: competitor, error } = await supabase
      .from('competitor_accounts')
      .insert({
        user_id: user.id,
        competitor_name: body.competitor_name,
        linkedin_url: body.linkedin_url,
        company_name: body.company_name,
        industry: body.industry,
        notes: body.notes,
        sync_enabled: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating competitor:', error)
      return NextResponse.json({ error: 'Failed to add competitor' }, { status: 500 })
    }

    return NextResponse.json({ competitor, message: 'Competitor added successfully' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove competitor
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('id')

    if (!competitorId) {
      return NextResponse.json({ error: 'Competitor ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('competitor_accounts')
      .delete()
      .eq('id', competitorId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting competitor:', error)
      return NextResponse.json({ error: 'Failed to delete competitor' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Competitor removed successfully' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
