-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR LINKEDAI SAAS
-- Production-Ready Schema for Enterprise Applications
-- =====================================================

-- =====================================================
-- 1. PROFILES & USER MANAGEMENT
-- =====================================================

-- Enhanced User Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',

  -- LinkedIn Connection
  linkedin_connected BOOLEAN DEFAULT FALSE,
  linkedin_access_token TEXT,
  linkedin_refresh_token TEXT,
  linkedin_user_id TEXT,
  linkedin_profile_url TEXT,
  linkedin_token_expires_at TIMESTAMP WITH TIME ZONE,

  -- Preferences
  expertise_topics TEXT[] DEFAULT '{}',
  preferred_posting_times JSONB DEFAULT '[]', -- [{day: 1, hour: 9}, ...]
  content_preferences JSONB DEFAULT '{}', -- {tone: 'professional', length: 'medium'}
  notification_settings JSONB DEFAULT '{"email": true, "browser": true}',

  -- Onboarding & Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  email_verified BOOLEAN DEFAULT FALSE,

  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Logs (for security & analytics)
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'post_created', 'post_published', 'settings_changed'
  activity_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team/Workspace Management
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- 2. CONTENT MANAGEMENT (POSTS)
-- =====================================================

-- Enhanced Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

  -- Content
  content TEXT NOT NULL,
  title TEXT, -- Optional internal title
  topic TEXT,
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',

  -- Media
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'carousel', NULL)),
  thumbnail_url TEXT,

  -- AI Generation Metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  ai_model TEXT, -- 'gpt-4', 'gpt-3.5-turbo'
  writing_style TEXT, -- 'professional', 'casual', 'storytelling'
  tone TEXT, -- 'informative', 'inspirational', 'educational'

  -- Status & Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,

  -- LinkedIn Integration
  linkedin_post_id TEXT,
  linkedin_post_url TEXT,
  linkedin_urn TEXT,

  -- Analytics & Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  best_performing BOOLEAN DEFAULT FALSE,

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  is_template BOOLEAN DEFAULT FALSE,
  template_category TEXT,

  -- Metadata
  word_count INTEGER,
  character_count INTEGER,
  reading_time INTEGER, -- in seconds
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Versions (Track edits)
CREATE TABLE post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Analytics (Detailed tracking)
CREATE TABLE post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,

  -- Daily snapshots
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  -- Demographics (from LinkedIn API)
  demographics JSONB DEFAULT '{}', -- {countries: {}, industries: {}, seniorities: {}}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, date)
);

-- Post Comments (synced from LinkedIn)
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  linkedin_comment_id TEXT UNIQUE,
  author_name TEXT,
  author_linkedin_url TEXT,
  content TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CONTENT TEMPLATES & LIBRARY
-- =====================================================

-- Content Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'announcement', 'tips', 'quote', 'question'
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- [{name: 'company', default: 'ACME Corp'}]
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's Saved Content Ideas
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  sources TEXT[] DEFAULT '{}', -- URLs or references
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'in_progress', 'drafted', 'published')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SCHEDULING & AUTOMATION
-- =====================================================

-- Posting Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  enabled BOOLEAN DEFAULT TRUE,
  recurring BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}', -- Filter posts by tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue Management
CREATE TABLE post_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 5. SUBSCRIPTIONS & BILLING
-- =====================================================

-- Enhanced Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Plan Details
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),

  -- Quotas
  posts_limit INTEGER DEFAULT 5,
  posts_used INTEGER DEFAULT 0,
  ai_credits_limit INTEGER DEFAULT 10,
  ai_credits_used INTEGER DEFAULT 0,
  team_members_limit INTEGER DEFAULT 1,

  -- Billing Period
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Stripe Integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Payment History
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- Stripe Data
  stripe_payment_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  stripe_invoice_url TEXT,

  -- Metadata
  payment_method TEXT, -- 'card', 'bank_transfer'
  failure_reason TEXT,
  receipt_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'post', 'ai_generation', 'api_call'
  resource_id UUID,
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ANALYTICS & INSIGHTS
-- =====================================================

-- User Analytics Dashboard Data
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Time Period
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  total_posts INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Growth
  followers_gained INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,

  -- Top Content
  top_post_id UUID REFERENCES posts(id),
  best_day_of_week INTEGER,
  best_hour_of_day INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_start)
);

-- =====================================================
-- 7. AI & AUTOMATION
-- =====================================================

-- AI Generation History
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Input
  prompt TEXT NOT NULL,
  topic TEXT,
  style TEXT,
  tone TEXT,
  length TEXT,
  additional_context JSONB DEFAULT '{}',

  -- Output
  generated_content TEXT,
  alternatives TEXT[] DEFAULT '{}',

  -- AI Details
  model TEXT, -- 'gpt-4', 'gpt-3.5-turbo'
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  generation_time_ms INTEGER,

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,

  -- Post Connection
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Suggestions (AI-powered)
CREATE TABLE content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- 'topic', 'hashtag', 'optimal_time', 'improvement'
  title TEXT,
  description TEXT,
  data JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. NOTIFICATIONS & ALERTS
-- =====================================================

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'post_published', 'engagement_milestone', 'subscription_expiring'
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Queue
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'welcome', 'post_published', 'weekly_report'
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. INTEGRATIONS & API
-- =====================================================

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Store hashed version
  key_prefix TEXT NOT NULL, -- Store first 8 chars for display
  scopes TEXT[] DEFAULT '{}', -- ['read:posts', 'write:posts']
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['post.published', 'post.scheduled']
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Logs
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. REFERRALS & REWARDS
-- =====================================================

-- Referral Program
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_type TEXT, -- 'credits', 'discount', 'free_month'
  reward_value DECIMAL(10,2),
  rewarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- =====================================================
-- 11. ADMIN & SUPPORT
-- =====================================================

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'bug', 'feature_request', 'billing', 'general'
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_linkedin_user_id ON profiles(linkedin_user_id);

-- Posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_for ON posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_linkedin_post_id ON posts(linkedin_post_id);
CREATE INDEX idx_posts_workspace_id ON posts(workspace_id);

-- Analytics
CREATE INDEX idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX idx_post_analytics_date ON post_analytics(date DESC);
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_period ON user_analytics(period_type, period_start);

-- Activity Logs
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Queue
CREATE INDEX idx_post_queue_status ON post_queue(status) WHERE status = 'queued';
CREATE INDEX idx_post_queue_scheduled_for ON post_queue(scheduled_for);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Notifications
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts Policies
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Schedules Policies
CREATE POLICY "Users can manage own schedules" ON schedules FOR ALL USING (auth.uid() = user_id);

-- Templates Policies
CREATE POLICY "Users can view own templates" ON templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public templates" ON templates FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own templates" ON templates FOR ALL USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create free subscription
  INSERT INTO subscriptions (user_id, plan, posts_limit, ai_credits_limit, current_period_start, current_period_end)
  VALUES (
    NEW.id,
    'free',
    5,
    10,
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track post word count
CREATE OR REPLACE FUNCTION calculate_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count := array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
  NEW.character_count := length(NEW.content);
  NEW.reading_time := CEIL(NEW.word_count / 200.0) * 60; -- 200 words per minute
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_post_metrics_trigger BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION calculate_post_metrics();

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    posts_used = 0,
    ai_credits_used = 0,
    current_period_start = current_period_end,
    current_period_end = current_period_end + INTERVAL '30 days'
  WHERE current_period_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: User Dashboard Summary
CREATE VIEW user_dashboard_summary AS
SELECT
  p.id as user_id,
  COUNT(DISTINCT posts.id) FILTER (WHERE posts.status = 'published') as total_published,
  COUNT(DISTINCT posts.id) FILTER (WHERE posts.status = 'draft') as total_drafts,
  COUNT(DISTINCT posts.id) FILTER (WHERE posts.status = 'scheduled') as total_scheduled,
  COALESCE(SUM(posts.views_count), 0) as total_views,
  COALESCE(SUM(posts.likes_count), 0) as total_likes,
  COALESCE(SUM(posts.comments_count), 0) as total_comments,
  COALESCE(AVG(posts.engagement_rate), 0) as avg_engagement_rate
FROM profiles p
LEFT JOIN posts ON p.id = posts.user_id
GROUP BY p.id;

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT (Optional)
-- =====================================================

-- You can add sample data here for testing
-- INSERT INTO templates (name, category, content, is_public) VALUES ...
