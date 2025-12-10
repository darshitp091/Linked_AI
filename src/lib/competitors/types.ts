// Competitive Intelligence Types

export interface CompetitorAccount {
  id: string
  user_id: string
  competitor_name: string
  linkedin_url: string
  linkedin_account_id?: string
  company_name?: string
  industry?: string
  follower_count: number
  posting_frequency?: number
  avg_engagement_rate?: number
  last_synced_at?: string
  sync_enabled: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface CompetitorPost {
  id: string
  competitor_account_id: string
  post_url: string
  linkedin_post_id?: string
  content?: string
  media_urls: string[]
  posted_at: string
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate?: number
  topic_tags: string[]
  content_type?: 'article' | 'image' | 'video' | 'poll' | 'document'
  synced_at: string
}

export interface TrendingTopic {
  id: string
  topic: string
  hashtag?: string
  industry: string
  trend_score: number
  post_count: number
  engagement_rate?: number
  velocity: 'rising' | 'falling' | 'stable'
  trending_since?: string
  last_updated_at: string
  created_at: string
}

export interface ContentBenchmark {
  id: string
  industry: string
  content_type: string
  metric_name: string
  metric_value: number
  percentile_25?: number
  percentile_50?: number
  percentile_75?: number
  percentile_90?: number
  sample_size?: number
  calculated_at: string
}

export interface CompetitorAnalysis {
  competitor: CompetitorAccount
  recent_posts: CompetitorPost[]
  performance_summary: {
    avg_views: number
    avg_likes: number
    avg_comments: number
    avg_engagement_rate: number
    posting_frequency: number
    best_performing_topics: string[]
    best_posting_times: string[]
  }
  comparison_to_user: {
    follower_difference: number
    engagement_rate_difference: number
    posting_frequency_difference: number
  }
}

export interface IndustryTrends {
  trending_topics: TrendingTopic[]
  top_hashtags: string[]
  rising_topics: TrendingTopic[]
  content_type_performance: {
    type: string
    avg_engagement: number
  }[]
}
