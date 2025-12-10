import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeadListsClient from './LeadListsClient'

export const metadata: Metadata = {
  title: 'Lead Lists | LinkedAI',
  description: 'Organize your LinkedIn leads into custom lists'
}

export default async function LeadListsPage() {
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

  // Check if user has Pro access
  if (userPlan === 'free') {
    // Free users can't access lead lists
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-12 text-white text-center">
          <h1 className="text-3xl font-bold mb-4">Lead Lists</h1>
          <p className="text-purple-100 mb-6 text-lg">
            Organize your leads into custom lists for better management and segmentation
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 max-w-md mx-auto">
            <h3 className="font-bold text-xl mb-4">Pro Feature</h3>
            <ul className="text-left space-y-2 text-purple-100">
              <li>✅ Create unlimited custom lists</li>
              <li>✅ Tag and segment leads</li>
              <li>✅ Bulk actions on lists</li>
              <li>✅ Export lists to CSV</li>
              <li>✅ Smart list filtering</li>
            </ul>
          </div>

          <a
            href="/pricing"
            className="inline-flex px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    )
  }

  // Get all lists with lead counts
  const { data: lists } = await supabase
    .from('lead_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get all leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <LeadListsClient
      lists={lists || []}
      leads={leads || []}
      userPlan={userPlan}
    />
  )
}
