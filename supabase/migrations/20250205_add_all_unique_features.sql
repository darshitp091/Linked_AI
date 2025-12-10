-- Migration: Add all unique differentiating features
-- Lead Generation, Content Intelligence, Audience Intelligence, Competitive Intelligence, AI Automation

-- ============================================
-- LEAD GENERATION SYSTEM
-- ============================================

-- Leads table: Store discovered LinkedIn leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linkedin_url TEXT NOT NULL,
  linkedin_user_id TEXT,
  full_name TEXT,
  headline TEXT,
  company TEXT,
  job_title TEXT,
  location TEXT,
  profile_picture_url TEXT,
  connection_degree INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  lead_score INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  last_engaged_at TIMESTAMPTZ,
  notes TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, rejected
  source TEXT, -- search, engagement, import
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, linkedin_url)
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);

-- Lead lists: Organize leads into lists
CREATE TABLE IF NOT EXISTS lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  lead_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_lists_user_id ON lead_lists(user_id);

-- Lead list members: Many-to-many relationship
CREATE TABLE IF NOT EXISTS lead_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_list_id UUID NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_list_id, lead_id)
);

CREATE INDEX idx_lead_list_members_list_id ON lead_list_members(lead_list_id);
CREATE INDEX idx_lead_list_members_lead_id ON lead_list_members(lead_id);

-- Lead activities: Track lead engagement with posts
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL, -- view, like, comment, share, connection_accepted
  activity_data JSONB DEFAULT '{}'::JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_post_id ON lead_activities(post_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_detected_at ON lead_activities(detected_at DESC);

-- Lead engagement automation
CREATE TABLE IF NOT EXISTS lead_engagement_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- comment, like, connection_request, message
  action_content TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

CREATE INDEX idx_lead_engagement_queue_user_id ON lead_engagement_queue(user_id);
CREATE INDEX idx_lead_engagement_queue_status ON lead_engagement_queue(status);
CREATE INDEX idx_lead_engagement_queue_scheduled ON lead_engagement_queue(scheduled_for);

-- ============================================
-- CONTENT INTELLIGENCE SYSTEM
-- ============================================

-- Post predictions: Viral content prediction scores
CREATE TABLE IF NOT EXISTS post_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  virality_score INTEGER NOT NULL CHECK (virality_score >= 0 AND virality_score <= 100),
  predicted_views INTEGER,
  predicted_likes INTEGER,
  predicted_comments INTEGER,
  predicted_shares INTEGER,
  predicted_engagement_rate DECIMAL(5,2),
  confidence_level TEXT DEFAULT 'medium', -- low, medium, high
  suggestions JSONB DEFAULT '[]'::JSONB,
  prediction_factors JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Actual performance (filled after 24h)
  actual_views INTEGER,
  actual_likes INTEGER,
  actual_comments INTEGER,
  actual_shares INTEGER,
  actual_engagement_rate DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_predictions_post_id ON post_predictions(post_id);
CREATE INDEX idx_post_predictions_virality_score ON post_predictions(virality_score DESC);

-- Post insights: AI-generated performance analysis
CREATE TABLE IF NOT EXISTS post_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  autopsy_report TEXT,
  success_factors JSONB DEFAULT '[]'::JSONB,
  areas_for_improvement JSONB DEFAULT '[]'::JSONB,
  comparison_to_history JSONB DEFAULT '{}'::JSONB,
  key_learnings TEXT[],
  recommended_actions TEXT[],
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_insights_post_id ON post_insights(post_id);
CREATE INDEX idx_post_insights_generated_at ON post_insights(generated_at DESC);

-- Content gaps: Track content strategy gaps
CREATE TABLE IF NOT EXISTS content_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gap_type TEXT NOT NULL, -- topic, content_type, posting_frequency, engagement_time
  description TEXT NOT NULL,
  recommended_action TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'open', -- open, addressed, dismissed
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  addressed_at TIMESTAMPTZ
);

CREATE INDEX idx_content_gaps_user_id ON content_gaps(user_id);
CREATE INDEX idx_content_gaps_status ON content_gaps(status);
CREATE INDEX idx_content_gaps_priority ON content_gaps(priority DESC);

-- ============================================
-- AUDIENCE INTELLIGENCE SYSTEM
-- ============================================

-- Follower snapshots: Daily follower count tracking
CREATE TABLE IF NOT EXISTS follower_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_account_id UUID NOT NULL REFERENCES linkedin_accounts(id) ON DELETE CASCADE,
  follower_count INTEGER NOT NULL DEFAULT 0,
  connection_count INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL,
  growth_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(linkedin_account_id, snapshot_date)
);

CREATE INDEX idx_follower_snapshots_account_id ON follower_snapshots(linkedin_account_id);
CREATE INDEX idx_follower_snapshots_date ON follower_snapshots(snapshot_date DESC);

-- Top engagers: Track most engaged followers
CREATE TABLE IF NOT EXISTS top_engagers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linkedin_account_id UUID REFERENCES linkedin_accounts(id) ON DELETE CASCADE,
  engager_name TEXT NOT NULL,
  engager_linkedin_url TEXT,
  engager_linkedin_id TEXT,
  engager_headline TEXT,
  engager_profile_picture TEXT,
  engager_profile_data JSONB DEFAULT '{}'::JSONB,
  engagement_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  last_engagement_at TIMESTAMPTZ,
  influence_score INTEGER DEFAULT 0,
  relationship_strength INTEGER DEFAULT 0 CHECK (relationship_strength >= 0 AND relationship_strength <= 100),
  is_converted_to_lead BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, engager_linkedin_url)
);

CREATE INDEX idx_top_engagers_user_id ON top_engagers(user_id);
CREATE INDEX idx_top_engagers_engagement_count ON top_engagers(engagement_count DESC);
CREATE INDEX idx_top_engagers_influence_score ON top_engagers(influence_score DESC);

-- Engagement quality metrics
CREATE TABLE IF NOT EXISTS engagement_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  weighted_engagement_score DECIMAL(10,2),
  comment_sentiment_positive INTEGER DEFAULT 0,
  comment_sentiment_neutral INTEGER DEFAULT 0,
  comment_sentiment_negative INTEGER DEFAULT 0,
  superfan_engagement_count INTEGER DEFAULT 0,
  influencer_engagement_count INTEGER DEFAULT 0,
  discussion_depth INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_quality_post_id ON engagement_quality_metrics(post_id);
CREATE INDEX idx_engagement_quality_score ON engagement_quality_metrics(quality_score DESC);

-- ============================================
-- COMPETITIVE INTELLIGENCE SYSTEM
-- ============================================

-- Competitor accounts
CREATE TABLE IF NOT EXISTS competitor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  linkedin_account_id TEXT,
  company_name TEXT,
  industry TEXT,
  follower_count INTEGER DEFAULT 0,
  posting_frequency DECIMAL(5,2),
  avg_engagement_rate DECIMAL(5,2),
  last_synced_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, linkedin_url)
);

CREATE INDEX idx_competitor_accounts_user_id ON competitor_accounts(user_id);
CREATE INDEX idx_competitor_accounts_sync_enabled ON competitor_accounts(sync_enabled);

-- Competitor posts
CREATE TABLE IF NOT EXISTS competitor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_account_id UUID NOT NULL REFERENCES competitor_accounts(id) ON DELETE CASCADE,
  post_url TEXT UNIQUE NOT NULL,
  linkedin_post_id TEXT,
  content TEXT,
  media_urls TEXT[],
  posted_at TIMESTAMPTZ NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  topic_tags TEXT[],
  content_type TEXT, -- article, image, video, poll, document
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_posts_account_id ON competitor_posts(competitor_account_id);
CREATE INDEX idx_competitor_posts_posted_at ON competitor_posts(posted_at DESC);
CREATE INDEX idx_competitor_posts_engagement_rate ON competitor_posts(engagement_rate DESC);
CREATE INDEX idx_competitor_posts_topic_tags ON competitor_posts USING GIN(topic_tags);

-- Trending topics
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  hashtag TEXT,
  industry TEXT NOT NULL,
  trend_score INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  velocity TEXT DEFAULT 'stable', -- rising, falling, stable
  trending_since TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic, industry)
);

CREATE INDEX idx_trending_topics_industry ON trending_topics(industry);
CREATE INDEX idx_trending_topics_trend_score ON trending_topics(trend_score DESC);
CREATE INDEX idx_trending_topics_velocity ON trending_topics(velocity);

-- Content benchmarks
CREATE TABLE IF NOT EXISTS content_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  content_type TEXT NOT NULL,
  metric_name TEXT NOT NULL, -- avg_views, avg_likes, avg_engagement_rate
  metric_value DECIMAL(10,2) NOT NULL,
  percentile_25 DECIMAL(10,2),
  percentile_50 DECIMAL(10,2),
  percentile_75 DECIMAL(10,2),
  percentile_90 DECIMAL(10,2),
  sample_size INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry, content_type, metric_name)
);

CREATE INDEX idx_content_benchmarks_industry ON content_benchmarks(industry);
CREATE INDEX idx_content_benchmarks_content_type ON content_benchmarks(content_type);

-- ============================================
-- AI AUTOMATION SYSTEM
-- ============================================

-- Comment responses: AI-generated replies
CREATE TABLE IF NOT EXISTS comment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment_id TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  commenter_name TEXT,
  commenter_linkedin_url TEXT,
  generated_reply TEXT NOT NULL,
  user_approved_reply TEXT,
  sentiment TEXT, -- positive, neutral, negative, question
  posted_to_linkedin BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ,
  user_feedback TEXT, -- approved, edited, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comment_responses_post_id ON comment_responses(post_id);
CREATE INDEX idx_comment_responses_posted ON comment_responses(posted_to_linkedin);
CREATE INDEX idx_comment_responses_sentiment ON comment_responses(sentiment);

-- Enhanced content ideas (using existing table structure, just adding more fields)
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS predicted_virality_score INTEGER;
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS trending_topic_id UUID REFERENCES trending_topics(id) ON DELETE SET NULL;
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS competitor_inspiration_id UUID REFERENCES competitor_posts(id) ON DELETE SET NULL;
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;

-- ============================================
-- USAGE TRACKING FOR NEW FEATURES
-- ============================================

-- Feature usage limits
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL, -- lead_discovery, viral_prediction, competitor_tracking, etc.
  usage_count INTEGER DEFAULT 0,
  limit_count INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_name, period_start)
);

CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_period ON feature_usage(period_start, period_end);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_engagement_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE follower_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_engagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- Lead lists policies
CREATE POLICY "Users can view their own lead lists" ON lead_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lead lists" ON lead_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead lists" ON lead_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead lists" ON lead_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Lead list members policies
CREATE POLICY "Users can view their lead list members" ON lead_list_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lead_lists
      WHERE lead_lists.id = lead_list_members.lead_list_id
      AND lead_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their lead list members" ON lead_list_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lead_lists
      WHERE lead_lists.id = lead_list_members.lead_list_id
      AND lead_lists.user_id = auth.uid()
    )
  );

-- Lead activities policies
CREATE POLICY "Users can view activities for their leads" ON lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_activities.lead_id
      AND leads.user_id = auth.uid()
    )
  );

-- Post predictions policies
CREATE POLICY "Users can view predictions for their posts" ON post_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_predictions.post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage predictions for their posts" ON post_predictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_predictions.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Post insights policies (same as predictions)
CREATE POLICY "Users can view insights for their posts" ON post_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_insights.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Content gaps policies
CREATE POLICY "Users can view their own content gaps" ON content_gaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own content gaps" ON content_gaps
  FOR ALL USING (auth.uid() = user_id);

-- Follower snapshots policies
CREATE POLICY "Users can view snapshots for their accounts" ON follower_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM linkedin_accounts
      WHERE linkedin_accounts.id = follower_snapshots.linkedin_account_id
      AND linkedin_accounts.user_id = auth.uid()
    )
  );

-- Top engagers policies
CREATE POLICY "Users can view their own top engagers" ON top_engagers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own top engagers" ON top_engagers
  FOR ALL USING (auth.uid() = user_id);

-- Competitor accounts policies
CREATE POLICY "Users can view their own competitor accounts" ON competitor_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own competitor accounts" ON competitor_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Competitor posts policies
CREATE POLICY "Users can view posts from their competitors" ON competitor_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitor_accounts
      WHERE competitor_accounts.id = competitor_posts.competitor_account_id
      AND competitor_accounts.user_id = auth.uid()
    )
  );

-- Trending topics policies (public read)
CREATE POLICY "Anyone can view trending topics" ON trending_topics
  FOR SELECT USING (true);

-- Content benchmarks policies (public read)
CREATE POLICY "Anyone can view content benchmarks" ON content_benchmarks
  FOR SELECT USING (true);

-- Comment responses policies
CREATE POLICY "Users can view responses for their posts" ON comment_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comment_responses.post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage responses for their posts" ON comment_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comment_responses.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Feature usage policies
CREATE POLICY "Users can view their own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update lead list count
CREATE OR REPLACE FUNCTION update_lead_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lead_lists
    SET lead_count = lead_count + 1,
        updated_at = NOW()
    WHERE id = NEW.lead_list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lead_lists
    SET lead_count = lead_count - 1,
        updated_at = NOW()
    WHERE id = OLD.lead_list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_list_count_trigger
AFTER INSERT OR DELETE ON lead_list_members
FOR EACH ROW
EXECUTE FUNCTION update_lead_list_count();

-- Function to update lead engagement count
CREATE OR REPLACE FUNCTION update_lead_engagement_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET engagement_count = engagement_count + 1,
      last_engaged_at = NEW.detected_at,
      lead_score = LEAST(lead_score + 5, 100),
      updated_at = NOW()
  WHERE id = NEW.lead_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_engagement_count_trigger
AFTER INSERT ON lead_activities
FOR EACH ROW
EXECUTE FUNCTION update_lead_engagement_count();

-- Function to update top engagers
CREATE OR REPLACE FUNCTION update_top_engager_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from the post
  SELECT user_id INTO v_user_id FROM posts WHERE id = NEW.post_id;

  -- Update or insert top engager record
  INSERT INTO top_engagers (
    user_id,
    engager_name,
    engager_linkedin_url,
    engagement_count,
    likes_count,
    comments_count,
    shares_count,
    last_engagement_at
  )
  VALUES (
    v_user_id,
    NEW.activity_data->>'name',
    NEW.activity_data->>'linkedin_url',
    1,
    CASE WHEN NEW.activity_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'comment' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'share' THEN 1 ELSE 0 END,
    NEW.detected_at
  )
  ON CONFLICT (user_id, engager_linkedin_url)
  DO UPDATE SET
    engagement_count = top_engagers.engagement_count + 1,
    likes_count = top_engagers.likes_count + CASE WHEN NEW.activity_type = 'like' THEN 1 ELSE 0 END,
    comments_count = top_engagers.comments_count + CASE WHEN NEW.activity_type = 'comment' THEN 1 ELSE 0 END,
    shares_count = top_engagers.shares_count + CASE WHEN NEW.activity_type = 'share' THEN 1 ELSE 0 END,
    last_engagement_at = NEW.detected_at,
    influence_score = LEAST((top_engagers.engagement_count + 1) * 2, 100),
    updated_at = NOW();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_top_engager_stats_trigger
AFTER INSERT ON lead_activities
FOR EACH ROW
WHEN (NEW.activity_data ? 'linkedin_url')
EXECUTE FUNCTION update_top_engager_stats();

-- Function to calculate follower growth rate
CREATE OR REPLACE FUNCTION calculate_follower_growth_rate()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_count INTEGER;
BEGIN
  -- Get previous day's follower count
  SELECT follower_count INTO v_previous_count
  FROM follower_snapshots
  WHERE linkedin_account_id = NEW.linkedin_account_id
    AND snapshot_date = NEW.snapshot_date - INTERVAL '1 day'
  ORDER BY snapshot_date DESC
  LIMIT 1;

  -- Calculate growth rate
  IF v_previous_count IS NOT NULL AND v_previous_count > 0 THEN
    NEW.growth_rate = ((NEW.follower_count - v_previous_count)::DECIMAL / v_previous_count) * 100;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_follower_growth_rate_trigger
BEFORE INSERT ON follower_snapshots
FOR EACH ROW
EXECUTE FUNCTION calculate_follower_growth_rate();

-- ============================================
-- INITIAL DATA & DEFAULTS
-- ============================================

-- Insert default trending topics (samples)
INSERT INTO trending_topics (topic, hashtag, industry, trend_score, post_count, engagement_rate, velocity)
VALUES
  ('Artificial Intelligence', '#AI', 'Technology', 95, 15000, 4.5, 'rising'),
  ('Remote Work', '#RemoteWork', 'Business', 80, 8000, 3.2, 'stable'),
  ('Sustainability', '#Sustainability', 'Environment', 75, 6000, 3.8, 'rising'),
  ('Leadership', '#Leadership', 'Business', 70, 12000, 2.9, 'stable'),
  ('Digital Marketing', '#DigitalMarketing', 'Marketing', 85, 10000, 4.1, 'rising')
ON CONFLICT (topic, industry) DO NOTHING;

-- Insert sample content benchmarks
INSERT INTO content_benchmarks (industry, content_type, metric_name, metric_value, percentile_25, percentile_50, percentile_75, percentile_90, sample_size)
VALUES
  ('Technology', 'article', 'avg_views', 2500, 500, 1500, 4000, 8000, 10000),
  ('Technology', 'article', 'avg_engagement_rate', 3.5, 1.5, 2.8, 4.5, 7.0, 10000),
  ('Marketing', 'image', 'avg_views', 1800, 400, 1200, 3000, 6000, 8000),
  ('Marketing', 'image', 'avg_engagement_rate', 4.2, 2.0, 3.5, 5.5, 8.0, 8000),
  ('Business', 'poll', 'avg_engagement_rate', 6.5, 3.0, 5.0, 8.0, 12.0, 5000)
ON CONFLICT (industry, content_type, metric_name) DO NOTHING;

-- ============================================
-- UPDATE SUBSCRIPTIONS TABLE WITH NEW LIMITS
-- ============================================

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS leads_limit INTEGER DEFAULT 50;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS viral_predictions_limit INTEGER DEFAULT 5;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS competitor_tracking_limit INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_engagements_limit INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS content_ideas_limit INTEGER DEFAULT 5;

-- Update existing subscriptions with new limits based on plan
UPDATE subscriptions SET
  leads_limit = CASE
    WHEN plan = 'free' THEN 50
    WHEN plan = 'pro' THEN 500
    WHEN plan = 'standard' THEN 2000
    WHEN plan = 'custom' THEN 999999
    ELSE 50
  END,
  viral_predictions_limit = CASE
    WHEN plan = 'free' THEN 5
    WHEN plan = 'pro' THEN 100
    WHEN plan = 'standard' THEN 500
    WHEN plan = 'custom' THEN 999999
    ELSE 5
  END,
  competitor_tracking_limit = CASE
    WHEN plan = 'free' THEN 0
    WHEN plan = 'pro' THEN 3
    WHEN plan = 'standard' THEN 10
    WHEN plan = 'custom' THEN 999
    ELSE 0
  END,
  auto_engagements_limit = CASE
    WHEN plan = 'free' THEN 0
    WHEN plan = 'pro' THEN 20
    WHEN plan = 'standard' THEN 100
    WHEN plan = 'custom' THEN 999999
    ELSE 0
  END,
  content_ideas_limit = CASE
    WHEN plan = 'free' THEN 5
    WHEN plan = 'pro' THEN 20
    WHEN plan = 'standard' THEN 50
    WHEN plan = 'custom' THEN 999999
    ELSE 5
  END
WHERE leads_limit IS NULL;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_user_status_score ON leads(user_id, status, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_detected ON lead_activities(lead_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_account_posted ON competitor_posts(competitor_account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_top_engagers_user_engagement ON top_engagers(user_id, engagement_count DESC);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE leads IS 'Store discovered LinkedIn leads with scoring and tracking';
COMMENT ON TABLE lead_lists IS 'Organize leads into custom lists for segmentation';
COMMENT ON TABLE lead_activities IS 'Track all interactions between leads and user content';
COMMENT ON TABLE post_predictions IS 'AI-powered viral content prediction scores before publishing';
COMMENT ON TABLE post_insights IS 'Post-mortem analysis of published content performance';
COMMENT ON TABLE follower_snapshots IS 'Daily snapshots of follower counts for growth tracking';
COMMENT ON TABLE top_engagers IS 'Track and rank most engaged followers and influencers';
COMMENT ON TABLE competitor_accounts IS 'Monitor competitor LinkedIn accounts';
COMMENT ON TABLE competitor_posts IS 'Store competitor posts for benchmarking and analysis';
COMMENT ON TABLE trending_topics IS 'Track trending topics and hashtags by industry';
COMMENT ON TABLE comment_responses IS 'AI-generated comment replies for engagement automation';

-- Migration complete
