export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  expertise_topics: string[]
  linkedin_connected: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for?: string
  published_at?: string
  topic?: string
  engagement_score?: number
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  user_id: string
  day_of_week: number // 0-6, Sunday to Saturday
  time: string // HH:MM format
  enabled: boolean
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due'
  posts_remaining: number
  current_period_end: string
}

export interface GeneratedContent {
  topic: string
  hook: string
  body: string
  cta: string
  full_post: string
  suggested_hashtags: string[]
}
