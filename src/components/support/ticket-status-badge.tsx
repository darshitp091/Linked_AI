import { TicketStatus, TICKET_STATUS_LABELS } from '@/types/support'
import { CheckCircle, Clock, AlertCircle, XCircle, Loader } from 'lucide-react'

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

export function TicketStatusBadge({ status, className = '' }: TicketStatusBadgeProps) {
  const statusConfig: Record<TicketStatus, { color: string; icon: React.ReactNode; bg: string }> = {
    open: {
      color: 'text-blue-700',
      bg: 'bg-blue-100 border-blue-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    in_progress: {
      color: 'text-yellow-700',
      bg: 'bg-yellow-100 border-yellow-200',
      icon: <Loader className="w-3.5 h-3.5 animate-spin" />,
    },
    waiting_user: {
      color: 'text-orange-700',
      bg: 'bg-orange-100 border-orange-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    resolved: {
      color: 'text-green-700',
      bg: 'bg-green-100 border-green-200',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    closed: {
      color: 'text-gray-700',
      bg: 'bg-gray-100 border-gray-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${className}`}
    >
      {config.icon}
      {TICKET_STATUS_LABELS[status]}
    </span>
  )
}
