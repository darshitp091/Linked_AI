// Viral Content Prediction Types

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface PostPrediction {
  id: string
  post_id: string
  virality_score: number // 0-100
  predicted_views?: number
  predicted_likes?: number
  predicted_comments?: number
  predicted_shares?: number
  predicted_engagement_rate?: number
  confidence_level: ConfidenceLevel
  suggestions: PredictionSuggestion[]
  prediction_factors: PredictionFactors
  created_at: string
  // Actual performance (filled after 24h)
  actual_views?: number
  actual_likes?: number
  actual_comments?: number
  actual_shares?: number
  actual_engagement_rate?: number
  accuracy_score?: number
  updated_at: string
}

export interface PredictionSuggestion {
  type: 'hook' | 'structure' | 'cta' | 'hashtags' | 'length' | 'timing' | 'media'
  priority: 'high' | 'medium' | 'low'
  message: string
  expected_improvement: number // percentage
  example?: string
}

export interface PredictionFactors {
  hook_quality: number // 0-100
  content_structure: number // 0-100
  cta_strength: number // 0-100
  hashtag_relevance: number // 0-100
  optimal_length: boolean
  optimal_timing: boolean
  media_quality: number // 0-100
  topic_relevance: number // 0-100
}

export interface PostInsight {
  id: string
  post_id: string
  autopsy_report: string // markdown
  success_factors: string[]
  areas_for_improvement: string[]
  comparison_to_history: {
    better_than_avg: boolean
    percentile: number
    best_performing_element: string
    underperforming_element: string
  }
  key_learnings: string[]
  recommended_actions: string[]
  generated_at: string
}

export interface ContentGap {
  id: string
  user_id: string
  gap_type: 'topic' | 'content_type' | 'posting_frequency' | 'engagement_time'
  description: string
  recommended_action: string
  priority: 1 | 2 | 3 | 4 | 5
  status: 'open' | 'addressed' | 'dismissed'
  detected_at: string
  addressed_at?: string
}

export interface ViralityAnalysis {
  score: number
  prediction: PostPrediction
  suggestions: PredictionSuggestion[]
  comparison: {
    vs_user_average: number
    vs_industry_average: number
  }
}
