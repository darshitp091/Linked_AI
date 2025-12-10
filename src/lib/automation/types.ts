// AI Automation Types

export type CommentSentiment = 'positive' | 'neutral' | 'negative' | 'question'
export type UserFeedback = 'approved' | 'edited' | 'rejected'

export interface CommentResponse {
  id: string
  post_id: string
  comment_id: string
  comment_text: string
  commenter_name?: string
  commenter_linkedin_url?: string
  generated_reply: string
  user_approved_reply?: string
  sentiment: CommentSentiment
  posted_to_linkedin: boolean
  posted_at?: string
  user_feedback?: UserFeedback
  created_at: string
}

export interface ContentIdea {
  id: string
  user_id: string
  title: string
  description: string
  content_type?: string
  category?: string
  status: 'new' | 'in_progress' | 'used' | 'archived'
  priority: number
  predicted_virality_score?: number
  trending_topic_id?: string
  competitor_inspiration_id?: string
  auto_generated: boolean
  created_at: string
  updated_at: string
}

export interface GeneratedContentIdea extends ContentIdea {
  reasoning: string
  suggested_hooks: string[]
  relevant_hashtags: string[]
  optimal_posting_time?: string
  expected_engagement?: number
}

export interface CommentAnalysis {
  sentiment: CommentSentiment
  intent: 'question' | 'praise' | 'criticism' | 'discussion' | 'spam'
  key_topics: string[]
  requires_response: boolean
  urgency: 'high' | 'medium' | 'low'
  suggested_tone: 'professional' | 'friendly' | 'empathetic' | 'enthusiastic'
}

export interface AutoEngagementSettings {
  auto_reply_enabled: boolean
  auto_like_threshold: number
  auto_thank_top_engagers: boolean
  engagement_tone: 'professional' | 'friendly' | 'casual'
  response_delay_minutes: number
  daily_limit: number
}
