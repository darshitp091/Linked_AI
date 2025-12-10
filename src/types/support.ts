export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'technical' | 'billing' | 'feature_request' | 'other'
export type PlanType = 'free' | 'pro' | 'standard' | 'custom'

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface SupportReply {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_staff: boolean
  created_at: string
}

export interface CreateTicketData {
  subject: string
  description: string
  category: TicketCategory
  priority?: TicketPriority
}

export interface UpdateTicketData {
  status?: TicketStatus
  priority?: TicketPriority
  assigned_to?: string
}

export interface CreateReplyData {
  message: string
}

// Plan-based support SLA (response time in hours)
export const SUPPORT_SLA: Record<PlanType, { responseTime: number; label: string }> = {
  free: { responseTime: 48, label: 'Standard support (response in 48h)' },
  pro: { responseTime: 24, label: 'Priority support (response in 24h)' },
  standard: { responseTime: 12, label: 'Priority support (response in 12h)' },
  custom: { responseTime: 6, label: 'Premium support (response in 6h)' },
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_user: 'Waiting for User',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical Issue',
  billing: 'Billing',
  feature_request: 'Feature Request',
  other: 'Other',
}
