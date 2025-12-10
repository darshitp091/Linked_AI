import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const minEngagements = parseInt(searchParams.get('min_engagements') || '3')

    // Get top engagers
    const { data: engagers, error } = await supabase
      .from('top_engagers')
      .select('*')
      .eq('user_id', user.id)
      .gte('engagement_count', minEngagements)
      .order('engagement_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top engagers:', error)
      return NextResponse.json({ error: 'Failed to fetch top engagers' }, { status: 500 })
    }

    // Calculate insights
    const totalEngagement = engagers?.reduce((sum, e) => sum + e.engagement_count, 0) || 0
    const avgEngagement = engagers?.length ? totalEngagement / engagers.length : 0

    const superfans = engagers?.filter(e => e.engagement_count >= 10).length || 0
    const influencers = engagers?.filter(e => e.influence_score >= 70).length || 0

    return NextResponse.json({
      engagers,
      insights: {
        total_unique_engagers: engagers?.length || 0,
        total_engagements: totalEngagement,
        avg_engagement_per_person: Number(avgEngagement.toFixed(2)),
        superfan_count: superfans,
        influencer_count: influencers,
        avg_relationship_strength: engagers?.length ?
          Number((engagers.reduce((sum, e) => sum + e.relationship_strength, 0) / engagers.length).toFixed(2)) : 0
      }
    })

  } catch (error) {
    console.error('Top engagers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Convert top engager to lead
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { engager_id } = body

    // Get engager details
    const { data: engager, error: engagerError } = await supabase
      .from('top_engagers')
      .select('*')
      .eq('id', engager_id)
      .eq('user_id', user.id)
      .single()

    if (engagerError || !engager) {
      return NextResponse.json({ error: 'Engager not found' }, { status: 404 })
    }

    // Check if already a lead
    if (engager.is_converted_to_lead) {
      return NextResponse.json({ error: 'Already converted to lead' }, { status: 400 })
    }

    // Create lead from engager
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        linkedin_url: engager.engager_linkedin_url || '',
        linkedin_user_id: engager.engager_linkedin_id,
        full_name: engager.engager_name,
        headline: engager.engager_headline,
        profile_picture_url: engager.engager_profile_picture,
        lead_score: Math.min(engager.influence_score + engager.relationship_strength, 100),
        engagement_count: engager.engagement_count,
        tags: ['top-engager', 'hot-lead'],
        source: 'engagement',
        status: 'qualified'
      })
      .select()
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    // Mark engager as converted
    await supabase
      .from('top_engagers')
      .update({ is_converted_to_lead: true })
      .eq('id', engager_id)

    return NextResponse.json({ lead, message: 'Top engager converted to lead successfully' })

  } catch (error) {
    console.error('Convert engager error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
