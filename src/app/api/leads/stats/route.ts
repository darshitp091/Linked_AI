import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get overall stats
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, lead_score, engagement_count')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching lead stats:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    const stats = {
      total_leads: leads?.length || 0,
      new_leads: leads?.filter(l => l.status === 'new').length || 0,
      contacted_leads: leads?.filter(l => l.status === 'contacted').length || 0,
      qualified_leads: leads?.filter(l => l.status === 'qualified').length || 0,
      converted_leads: leads?.filter(l => l.status === 'converted').length || 0,
      avg_lead_score: leads?.length ?
        Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length) : 0,
      total_engagement: leads?.reduce((sum, l) => sum + (l.engagement_count || 0), 0) || 0
    }

    // Get this month's discovery count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyDiscovery } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    // Get user's limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, leads_limit')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      stats,
      monthly: {
        discovered: monthlyDiscovery || 0,
        limit: subscription?.leads_limit || 50,
        remaining: (subscription?.leads_limit || 50) - (monthlyDiscovery || 0)
      }
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
