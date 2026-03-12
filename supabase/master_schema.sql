-- =====================================================
-- LINKEDAI MASTER SCHEMA (CONSOLIDATED)
-- Single source of truth for the entire database
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- PROFILES: Core user information and basic limits
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Account Status
  subscription_plan TEXT DEFAULT 'free', -- free, pro, standard, custom
  linkedin_connected BOOLEAN DEFAULT FALSE,
  
  -- Limits & Usage (Backwards compatibility + redundancy)
  posts_limit INTEGER DEFAULT 5,
  posts_remaining INTEGER DEFAULT 5,
  posts_used INTEGER DEFAULT 0,
  linkedin_accounts_limit INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS: Detailed billing and quota management
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'standard', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),
  
  -- Quotas
  ai_generations_limit INTEGER DEFAULT 5,
  ai_generations_used INTEGER DEFAULT 0,
  ai_generations_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  
  -- Billing Period
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- LINKEDIN ACCOUNTS: Support for multiple LinkedIn connections
CREATE TABLE IF NOT EXISTS public.linkedin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- LinkedIn Connection Details
  linkedin_user_id TEXT NOT NULL,
  linkedin_access_token TEXT NOT NULL,
  linkedin_refresh_token TEXT,
  linkedin_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Profile Information
  linkedin_profile_url TEXT,
  profile_name TEXT,
  profile_headline TEXT,
  profile_picture_url TEXT,
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, linkedin_user_id)
);

-- POSTS: AI Generated and Scheduled content
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  linkedin_account_id UUID REFERENCES public.linkedin_accounts(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,
  title TEXT,
  
  -- Status & Scheduling
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  
  -- Integration Data
  linkedin_post_id TEXT,
  
  -- Metrics
  word_count INTEGER,
  character_count INTEGER,
  reading_time INTEGER, -- in seconds
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOGS: Audit trail
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPORT SYSTEM
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS: In-app alerts for users
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system', 'plan_expiry')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  cta_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FUNCTIONS & TRIGGERS

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    subscription_plan,
    posts_limit,
    posts_remaining,
    linkedin_accounts_limit
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'free',
    5,
    5,
    1
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    ai_generations_limit,
    current_period_start,
    current_period_end
  )
  VALUES (
    NEW.id,
    'free',
    5,
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CREDIT RENEWAL LOGIC: Automatic renewal based on joining date
-- This function can be called by a cron job or a trigger
CREATE OR REPLACE FUNCTION public.check_and_renew_credits()
RETURNS VOID AS $$
BEGIN
  -- Update subscriptions where the current period has ended
  UPDATE public.subscriptions s
  SET 
    ai_generations_used = 0,
    current_period_start = current_period_end,
    current_period_end = current_period_end + INTERVAL '1 month',
    updated_at = NOW()
  WHERE current_period_end <= NOW();

  -- Sync profiles table (backwards compatibility)
  UPDATE public.profiles p
  SET 
    posts_remaining = p.posts_limit,
    posts_used = 0,
    updated_at = NOW()
  FROM public.subscriptions s
  WHERE p.id = s.user_id 
    AND s.updated_at >= NOW() - INTERVAL '1 minute'; -- Only update those recently renewed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to calculate post metrics
CREATE OR REPLACE FUNCTION public.calculate_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL THEN
    NEW.word_count := array_length(regexp_split_to_array(TRIM(NEW.content), '\s+'), 1);
    NEW.character_count := length(NEW.content);
    NEW.reading_time := CEIL(NEW.word_count / 200.0) * 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_post_metrics_trigger ON public.posts;
CREATE TRIGGER calculate_post_metrics_trigger 
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.calculate_post_metrics();

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_linkedin_accounts_updated_at BEFORE UPDATE ON public.linkedin_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. RLS POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Own data only
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Own data only
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- LinkedIn Accounts: Own data only
CREATE POLICY "Users can manage own linkedin accounts" ON public.linkedin_accounts FOR ALL USING (auth.uid() = user_id);

-- Posts: Own data only
CREATE POLICY "Users can manage own posts" ON public.posts FOR ALL USING (auth.uid() = user_id);

-- Logs: Own data only
CREATE POLICY "Users can view own activity logs" ON public.user_activity_logs FOR SELECT USING (auth.uid() = user_id);

-- Support: Own data only
CREATE POLICY "Users can manage own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own ticket replies" ON public.support_replies FOR SELECT USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));
CREATE POLICY "Users can create ticket replies" ON public.support_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Own data only
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_user ON public.linkedin_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON public.posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
