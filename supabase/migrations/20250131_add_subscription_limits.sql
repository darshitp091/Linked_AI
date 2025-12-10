-- Migration: Add missing limit fields to subscriptions table
-- This ensures subscription limits are properly tracked for feature gating

-- Add posts_limit column (currently only posts_remaining exists)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS posts_limit INTEGER DEFAULT 5;

-- Add AI credits tracking
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS ai_credits_limit INTEGER DEFAULT 5;

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS ai_credits_used INTEGER DEFAULT 0;

-- Update existing subscriptions based on their plan
UPDATE subscriptions
SET posts_limit = CASE
  WHEN plan = 'pro' THEN 25
  WHEN plan = 'standard' THEN 100
  WHEN plan = 'custom' THEN 999999
  ELSE 5
END
WHERE posts_limit IS NULL OR posts_limit = 5;

UPDATE subscriptions
SET ai_credits_limit = CASE
  WHEN plan = 'pro' THEN 25
  WHEN plan = 'standard' THEN 100
  WHEN plan = 'custom' THEN 999999
  ELSE 5
END
WHERE ai_credits_limit IS NULL OR ai_credits_limit = 5;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_plan ON subscriptions(user_id, plan);

-- Add comments
COMMENT ON COLUMN subscriptions.posts_limit IS 'Maximum posts allowed per month based on subscription plan';
COMMENT ON COLUMN subscriptions.ai_credits_limit IS 'Maximum AI generation credits per month';
COMMENT ON COLUMN subscriptions.ai_credits_used IS 'AI credits used in current period';
