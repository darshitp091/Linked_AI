'use client'

import { SupportTicket } from '@/types/support'
import { TicketStatusBadge } from './ticket-status-badge'
import { TicketPriorityBadge } from './ticket-priority-badge'
import { Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface TicketListProps {
  tickets: SupportTicket[]
  onTicketClick?: (ticket: SupportTicket) => void
}

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No support tickets</h3>
        <p className="text-gray-500 text-sm">
          Create a ticket to get help from our support team
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/support/${ticket.id}`}
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0a66c2] hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {ticket.subject}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {ticket.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(ticket.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
            </div>
            {ticket.category && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
