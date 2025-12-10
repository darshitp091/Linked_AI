import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeadDiscoveryClient from './LeadDiscoveryClient'

export const metadata: Metadata = {
  title: 'Discover Leads | LinkedAI',
  description: 'Search and discover LinkedIn leads for your business'
}

export default async function LeadDiscoveryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get subscription and usage
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, leads_discovered_this_week, leads_week_reset_at')
    .eq('user_id', user.id)
    .single()

  // Calculate weekly limits
  const weeklyLimit = subscription?.plan === 'free' ? 10 :
                     subscription?.plan === 'pro' ? 125 :
                     subscription?.plan === 'standard' ? 500 : 9999

  const weeklyUsed = subscription?.leads_discovered_this_week || 0
  const weeklyRemaining = weeklyLimit - weeklyUsed

  // Get existing lead lists for quick add
  const { data: leadLists } = await supabase
    .from('lead_lists')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  return (
    <LeadDiscoveryClient
      weeklyLimit={weeklyLimit}
      weeklyUsed={weeklyUsed}
      weeklyRemaining={weeklyRemaining}
      userPlan={subscription?.plan || 'free'}
      leadLists={leadLists || []}
    />
  )
}
