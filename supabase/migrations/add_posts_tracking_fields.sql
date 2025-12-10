-- Add posts tracking fields to profiles table
-- This migration changes from credit-based to post-based tracking

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS posts_remaining INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS posts_used INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_posts_remaining ON profiles(posts_remaining);

-- Update existing profiles to have default values
UPDATE profiles
SET
  posts_remaining = COALESCE(posts_remaining, 5),
  posts_used = COALESCE(posts_used, 0)
WHERE posts_remaining IS NULL OR posts_used IS NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN profiles.posts_remaining IS 'Number of posts the user can still generate based on their plan';
COMMENT ON COLUMN profiles.posts_used IS 'Total number of posts the user has generated';
