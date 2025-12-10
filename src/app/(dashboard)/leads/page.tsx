import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Users, ListFilter, Download, Plus, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lead Generation | LinkedAI',
  description: 'Discover and manage LinkedIn leads'
}

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get subscription limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, leads_limit, leads_discovered_this_week, leads_week_reset_at')
    .eq('user_id', user.id)
    .single()

  // Get total leads count
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get leads by status
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const leadsByStatus = {
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    qualified: leads?.filter(l => l.status === 'qualified').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0
  }

  // Calculate weekly limit
  const weeklyLimit = subscription?.plan === 'free' ? 10 :
                     subscription?.plan === 'pro' ? 125 : // ~500/month
                     subscription?.plan === 'standard' ? 500 : // ~2000/month
                     9999

  const weeklyUsed = subscription?.leads_discovered_this_week || 0
  const weeklyRemaining = weeklyLimit - weeklyUsed

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lead Generation</h1>
        <p className="text-gray-600">
          Discover and manage LinkedIn leads for your business
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Leads</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold">{totalLeads || 0}</div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">New Leads</span>
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold">{leadsByStatus.new}</div>
          <div className="text-xs text-gray-500 mt-1">Not contacted</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Qualified</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold">{leadsByStatus.qualified}</div>
          <div className="text-xs text-gray-500 mt-1">High potential</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">This Week</span>
            <Search className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold">{weeklyUsed}/{weeklyLimit}</div>
          <div className="text-xs text-gray-500 mt-1">
            {weeklyRemaining} remaining
          </div>
        </div>
      </div>

      {/* Usage Alert */}
      {subscription?.plan === 'free' && weeklyRemaining <= 2 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">
                Almost at your weekly limit!
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                You have {weeklyRemaining} lead discoveries remaining this week.
                Upgrade to Pro for 500 leads/month.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/leads/discover"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <Search className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Discover Leads</h3>
          <p className="text-blue-100 text-sm">
            Search LinkedIn for potential leads by job title, company, industry
          </p>
          <div className="mt-4 text-sm font-semibold">
            {weeklyRemaining} discoveries left this week →
          </div>
        </Link>

        <Link
          href="/leads/lists"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          <ListFilter className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Lead Lists</h3>
          <p className="text-purple-100 text-sm">
            Organize leads into custom lists for better management
          </p>
          <div className="mt-4 text-sm font-semibold">
            {subscription?.plan === 'free' ? '⚠️ Pro feature' : 'Manage lists →'}
          </div>
        </Link>

        <Link
          href="/leads/export"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
        >
          <Download className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Export Leads</h3>
          <p className="text-green-100 text-sm">
            Export your leads to CSV for use in CRM systems
          </p>
          <div className="mt-4 text-sm font-semibold">
            {totalLeads || 0} leads ready to export →
          </div>
        </Link>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Leads</h2>
          <p className="text-sm text-gray-600 mt-1">
            Your most recently discovered leads
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads && leads.length > 0 ? (
                leads.slice(0, 10).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.location || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.job_title || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.company || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.lead_score}/100
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium mb-1">No leads yet</p>
                    <p className="text-sm mb-4">Start discovering leads to grow your network</p>
                    <Link
                      href="/leads/discover"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Discover Leads
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
