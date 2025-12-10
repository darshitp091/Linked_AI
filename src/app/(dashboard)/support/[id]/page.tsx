'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SupportTicket, SupportReply, TicketStatus } from '@/types/support'
import { TicketStatusBadge } from '@/components/support/ticket-status-badge'
import { TicketPriorityBadge } from '@/components/support/ticket-priority-badge'
import { ArrowLeft, Calendar, User, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [replies, setReplies] = useState<SupportReply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTicket()
    fetchReplies()
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/support/tickets/${ticketId}`)
      const data = await response.json()

      if (data.success) {
        setTicket(data.ticket)
      } else {
        toast.error('Ticket not found')
        router.push('/support')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/replies`)
      const data = await response.json()

      if (data.success) {
        setReplies(data.replies)
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyText.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Reply added successfully')
        setReplyText('')
        fetchReplies()
        fetchTicket() // Refresh ticket to update status
      } else {
        toast.error(data.error || 'Failed to add reply')
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      toast.error('Failed to add reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Ticket status updated')
        fetchTicket()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/support"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0a66c2] mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Support
      </Link>

      {/* Ticket Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
              <span className="text-sm text-gray-500">
                Ticket #{ticket.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Status Actions */}
          {ticket.status !== 'closed' && (
            <div className="flex gap-2">
              {ticket.status === 'resolved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('closed')}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Close Ticket
                </Button>
              )}
              {ticket.status === 'open' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('closed')}
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Close
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Ticket Meta */}
        <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(ticket.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="capitalize">{ticket.category?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Ticket Description */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <div className="text-gray-700 whitespace-pre-wrap">{ticket.description}</div>
      </div>

      {/* Replies Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Conversation ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No replies yet. Our support team will respond soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply: any) => (
              <div
                key={reply.id}
                className={`rounded-xl p-4 ${
                  reply.is_staff
                    ? 'bg-blue-50 border border-blue-100'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-medium text-sm">
                    {reply.is_staff ? 'S' : 'Y'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {reply.is_staff ? 'Support Team' : 'You'}
                      </span>
                      {reply.is_staff && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Staff
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap ml-11">
                  {reply.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Reply</h2>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none mb-4"
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {ticket.status === 'resolved' ? 'Adding a reply will reopen this ticket' : 'Our team will be notified of your reply'}
              </p>
              <Button type="submit" disabled={submitting || !replyText.trim()} className="gap-2">
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {ticket.status === 'closed' && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This ticket is closed</h3>
          <p className="text-gray-500 mb-4">
            If you need further assistance, please create a new support ticket.
          </p>
          <Link href="/support">
            <Button variant="outline">
              Create New Ticket
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
