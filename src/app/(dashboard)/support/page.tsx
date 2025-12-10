'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SupportTicket, TicketStatus, PlanType } from '@/types/support'
import { TicketList } from '@/components/support/ticket-list'
import { NewTicketForm } from '@/components/support/new-ticket-form'
import { PlanSupportInfo } from '@/components/support/plan-support-info'
import { Plus, LifeBuoy, Filter, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [userPlan, setUserPlan] = useState<PlanType>('free')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchUserPlan()
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, statusFilter, searchQuery])

  const fetchUserPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_plan) {
        setUserPlan(profile.subscription_plan as PlanType)
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets')
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets)
      } else {
        toast.error('Failed to load tickets')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.id.toLowerCase().includes(query)
      )
    }

    setFilteredTickets(filtered)
  }

  const handleNewTicketSuccess = () => {
    fetchTickets()
  }

  const getTicketCounts = () => {
    return {
      all: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      waiting_user: tickets.filter((t) => t.status === 'waiting_user').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
    }
  }

  const counts = getTicketCounts()

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-[#0a66c2]" />
            Support Center
          </h1>
          <p className="text-gray-500 mt-1">Get help and manage your support tickets</p>
        </div>
        <Button onClick={() => setShowNewTicketForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* Support Plan Info */}
      <PlanSupportInfo plan={userPlan} className="mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'all'
              ? 'border-[#0a66c2] bg-[#0a66c2]/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{counts.all}</div>
          <div className="text-sm text-gray-500 mt-1">All Tickets</div>
        </button>

        <button
          onClick={() => setStatusFilter('open')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'open'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-2xl font-bold text-blue-600">{counts.open}</div>
          <div className="text-sm text-gray-500 mt-1">Open</div>
        </button>

        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'in_progress'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-600">{counts.in_progress}</div>
          <div className="text-sm text-gray-500 mt-1">In Progress</div>
        </button>

        <button
          onClick={() => setStatusFilter('waiting_user')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'waiting_user'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-2xl font-bold text-orange-600">{counts.waiting_user}</div>
          <div className="text-sm text-gray-500 mt-1">Waiting</div>
        </button>

        <button
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'resolved'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{counts.resolved}</div>
          <div className="text-sm text-gray-500 mt-1">Resolved</div>
        </button>

        <button
          onClick={() => setStatusFilter('closed')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'closed'
              ? 'border-gray-500 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-2xl font-bold text-gray-600">{counts.closed}</div>
          <div className="text-sm text-gray-500 mt-1">Closed</div>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets by subject, description, or ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {statusFilter === 'all' ? 'All Tickets' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')} Tickets`}
          </h2>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-sm text-[#0a66c2] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <TicketList tickets={filteredTickets} />
      </div>

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <NewTicketForm
          onClose={() => setShowNewTicketForm(false)}
          onSuccess={handleNewTicketSuccess}
        />
      )}
    </div>
  )
}
