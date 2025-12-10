-- Migration: Add AI Generation Limits and Tracking
-- Enforce AI post generation limits per plan

-- Add AI generation tracking columns to subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS ai_generations_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS ai_generations_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_generations_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

-- Update existing subscriptions with limits based on plan
UPDATE subscriptions SET
  ai_generations_limit = CASE
    WHEN plan = 'free' THEN 5
    WHEN plan = 'pro' THEN 100
    WHEN plan = 'standard' THEN 500
    WHEN plan = 'custom' THEN 999999
    ELSE 5
  END,
  ai_generations_used = 0,
  ai_generations_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
WHERE ai_generations_limit IS NULL;

-- Create AI generation usage tracking table
CREATE TABLE IF NOT EXISTS ai_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL, -- 'post', 'variation', 'template'
  prompt TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_user_id ON ai_generation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_created_at ON ai_generation_usage(created_at DESC);

-- Enable RLS
ALTER TABLE ai_generation_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI generation usage" ON ai_generation_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI generation usage" ON ai_generation_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to reset monthly AI generation limits
CREATE OR REPLACE FUNCTION reset_monthly_ai_generations()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    ai_generations_used = 0,
    ai_generations_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
  WHERE ai_generations_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to track AI generation usage
CREATE OR REPLACE FUNCTION increment_ai_generation_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get current usage and limit
  SELECT ai_generations_used, ai_generations_limit
  INTO v_current_usage, v_limit
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- Check if limit reached
  IF v_current_usage >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment usage
  UPDATE subscriptions
  SET
    ai_generations_used = ai_generations_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update weekly lead limits (10/week for free)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS leads_discovered_this_week INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS leads_week_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('week', NOW() + INTERVAL '1 week');

-- Update existing records
UPDATE subscriptions SET
  leads_discovered_this_week = 0,
  leads_week_reset_at = DATE_TRUNC('week', NOW() + INTERVAL '1 week')
WHERE leads_discovered_this_week IS NULL;

-- Function to reset weekly lead limits
CREATE OR REPLACE FUNCTION reset_weekly_lead_limits()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    leads_discovered_this_week = 0,
    leads_week_reset_at = DATE_TRUNC('week', NOW() + INTERVAL '1 week')
  WHERE leads_week_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Update viral prediction limits (3/week for free)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS predictions_this_week INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS predictions_week_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('week', NOW() + INTERVAL '1 week');

UPDATE subscriptions SET
  predictions_this_week = 0,
  predictions_week_reset_at = DATE_TRUNC('week', NOW() + INTERVAL '1 week')
WHERE predictions_this_week IS NULL;

-- Comments for documentation
COMMENT ON COLUMN subscriptions.ai_generations_limit IS 'Monthly AI post generation limit by plan';
COMMENT ON COLUMN subscriptions.ai_generations_used IS 'AI generations used this month';
COMMENT ON COLUMN subscriptions.leads_discovered_this_week IS 'Leads discovered this week';
COMMENT ON COLUMN subscriptions.predictions_this_week IS 'Viral predictions used this week';

-- Migration complete
