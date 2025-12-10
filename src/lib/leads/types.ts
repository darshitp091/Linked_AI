// Lead Generation Types

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
export type LeadSource = 'search' | 'engagement' | 'import' | 'manual'
export type EngagementActionType = 'comment' | 'like' | 'connection_request' | 'message'

export interface Lead {
  id: string
  user_id: string
  linkedin_url: string
  linkedin_user_id?: string
  full_name?: string
  headline?: string
  company?: string
  job_title?: string
  location?: string
  profile_picture_url?: string
  connection_degree?: number
  tags: string[]
  lead_score: number
  engagement_count: number
  last_engaged_at?: string
  notes?: string
  status: LeadStatus
  source: LeadSource
  created_at: string
  updated_at: string
}

export interface LeadList {
  id: string
  user_id: string
  name: string
  description?: string
  lead_count: number
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  post_id?: string
  activity_type: 'view' | 'like' | 'comment' | 'share' | 'connection_accepted'
  activity_data: Record<string, any>
  detected_at: string
}

export interface LeadSearchFilters {
  keywords?: string
  job_title?: string
  company?: string
  location?: string
  industry?: string
  connection_degree?: number
  min_followers?: number
  tags?: string[]
}

export interface LeadSearchResult {
  leads: Lead[]
  total: number
  has_more: boolean
}

export interface LeadEngagementAction {
  id: string
  user_id: string
  lead_id: string
  action_type: EngagementActionType
  action_content?: string
  scheduled_for: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  executed_at?: string
}

export interface LeadStats {
  total_leads: number
  new_leads: number
  contacted_leads: number
  qualified_leads: number
  converted_leads: number
  avg_lead_score: number
  total_engagement: number
}
