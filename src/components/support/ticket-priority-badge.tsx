import { TicketPriority, TICKET_PRIORITY_LABELS } from '@/types/support'
import { ArrowDown, ArrowRight, ArrowUp, AlertTriangle } from 'lucide-react'

interface TicketPriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

export function TicketPriorityBadge({ priority, className = '' }: TicketPriorityBadgeProps) {
  const priorityConfig: Record<TicketPriority, { color: string; icon: React.ReactNode; bg: string }> = {
    low: {
      color: 'text-gray-600',
      bg: 'bg-gray-50 border-gray-200',
      icon: <ArrowDown className="w-3.5 h-3.5" />,
    },
    medium: {
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
      icon: <ArrowRight className="w-3.5 h-3.5" />,
    },
    high: {
      color: 'text-orange-600',
      bg: 'bg-orange-50 border-orange-200',
      icon: <ArrowUp className="w-3.5 h-3.5" />,
    },
    urgent: {
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  }

  const config = priorityConfig[priority]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${className}`}
    >
      {config.icon}
      {TICKET_PRIORITY_LABELS[priority]}
    </span>
  )
}
