-- Add subscription_plan column to profiles table
-- This allows storing plan info directly on profile for quick access

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise'));

-- Update existing profiles to have default value
UPDATE profiles
SET subscription_plan = COALESCE(subscription_plan, 'free')
WHERE subscription_plan IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- Add comment to explain the field
COMMENT ON COLUMN profiles.subscription_plan IS 'User subscription plan tier';
