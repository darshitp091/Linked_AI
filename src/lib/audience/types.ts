// Audience Intelligence Types

export interface FollowerSnapshot {
  id: string
  linkedin_account_id: string
  follower_count: number
  connection_count: number
  snapshot_date: string
  growth_rate?: number
  created_at: string
}

export interface FollowerGrowthData {
  snapshots: FollowerSnapshot[]
  current_followers: number
  total_growth: number
  growth_rate_7d: number
  growth_rate_30d: number
  avg_daily_growth: number
  projected_followers_30d: number
}

export interface TopEngager {
  id: string
  user_id: string
  linkedin_account_id?: string
  engager_name: string
  engager_linkedin_url?: string
  engager_linkedin_id?: string
  engager_headline?: string
  engager_profile_picture?: string
  engager_profile_data: Record<string, any>
  engagement_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  last_engagement_at?: string
  influence_score: number
  relationship_strength: number
  is_converted_to_lead: boolean
  created_at: string
  updated_at: string
}

export interface EngagementQualityMetrics {
  id: string
  post_id: string
  quality_score: number // 0-100
  weighted_engagement_score: number
  comment_sentiment_positive: number
  comment_sentiment_neutral: number
  comment_sentiment_negative: number
  superfan_engagement_count: number
  influencer_engagement_count: number
  discussion_depth: number
  calculated_at: string
}

export interface AudienceInsights {
  total_followers: number
  growth_trend: 'rising' | 'stable' | 'declining'
  top_engagers: TopEngager[]
  engagement_quality: number
  superfan_count: number
  influencer_count: number
  avg_relationship_strength: number
}
