import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeadExportClient from './LeadExportClient'

export const metadata: Metadata = {
  title: 'Export Leads | LinkedAI',
  description: 'Export your LinkedIn leads to CSV for CRM integration'
}

export default async function LeadExportPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const userPlan = subscription?.plan || 'free'

  // Get all leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get lead lists
  const { data: leadLists } = await supabase
    .from('lead_lists')
    .select('id, name, lead_ids')
    .eq('user_id', user.id)
    .order('name')

  return (
    <LeadExportClient
      leads={leads || []}
      leadLists={leadLists || []}
      userPlan={userPlan}
    />
  )
}
