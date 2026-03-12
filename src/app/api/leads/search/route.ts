import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const jobTitle = searchParams.get('jobTitle')
    const company = searchParams.get('company')
    const location = searchParams.get('location')
    const industry = searchParams.get('industry')

    // Check user's lead discovery limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, leads_limit, leads_discovered_this_week')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 403 })
    }

    // Weekly limit check
    const weeklyLimit = subscription.plan === 'free' ? 10 :
                       subscription.plan === 'pro' ? 125 :
                       subscription.plan === 'standard' ? 500 : 9999
    
    const weeklyUsed = subscription.leads_discovered_this_week || 0
    const remainingLeads = weeklyLimit - weeklyUsed

    if (remainingLeads <= 0) {
      return NextResponse.json({
        error: `Weekly lead discovery limit (${weeklyLimit}) reached.`,
        limit: weeklyLimit,
        used: weeklyUsed
      }, { status: 429 })
    }

    // LinkedIn API search implementation (Mock for now)
    const mockLeads = generateMockLeads({ query, jobTitle, company, location, industry })

    return NextResponse.json({
      leads: mockLeads,
      remaining_limit: remainingLeads
    })

  } catch (error) {
    console.error('Lead search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateMockLeads(filters: any) {
  const titles = [filters.jobTitle || 'Marketing Manager', 'Product Designer', 'Founder & CEO', 'VP of Sales', 'Software Engineer']
  const companies = [filters.company || 'TechCorp', 'Stripe', 'Airbnb', 'Notion', 'Figma']
  const locations = [filters.location || 'San Francisco, CA', 'New York, NY', 'London, UK', 'Remote', 'Berlin, Germany']

  return Array.from({ length: 15 }, (_, i) => ({
    id: `mock-${i}`,
    linkedin_url: `https://www.linkedin.com/in/lead-${i}`,
    full_name: `Prospective Lead ${i + 1}`,
    headline: `${titles[i % titles.length]} at ${companies[i % companies.length]}`,
    company: companies[i % companies.length],
    job_title: titles[i % titles.length],
    location: locations[i % locations.length],
    connection_degree: (i % 3) + 1,
    lead_score: Math.floor(Math.random() * 40) + 60 // 60-100
  }))
}
