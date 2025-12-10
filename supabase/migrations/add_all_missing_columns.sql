-- Add ALL missing columns to profiles table
-- This ensures all columns our code expects are present

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS posts_remaining INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS posts_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS posts_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS linkedin_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS google_calendar_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';

-- Update existing rows to have default values
UPDATE profiles
SET
  posts_remaining = COALESCE(posts_remaining, 5),
  posts_limit = COALESCE(posts_limit, 5),
  posts_used = COALESCE(posts_used, 0),
  linkedin_connected = COALESCE(linkedin_connected, FALSE),
  google_calendar_enabled = COALESCE(google_calendar_enabled, FALSE),
  google_calendar_id = COALESCE(google_calendar_id, 'primary')
WHERE
  posts_remaining IS NULL
  OR posts_limit IS NULL
  OR posts_used IS NULL
  OR linkedin_connected IS NULL
  OR google_calendar_enabled IS NULL
  OR google_calendar_id IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_posts_remaining ON profiles(posts_remaining);
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_connected ON profiles(linkedin_connected);

-- Add comments to explain the fields
COMMENT ON COLUMN profiles.posts_remaining IS 'Number of posts the user can still generate based on their plan';
COMMENT ON COLUMN profiles.posts_limit IS 'Maximum number of posts allowed for the user plan';
COMMENT ON COLUMN profiles.posts_used IS 'Total number of posts the user has generated';
COMMENT ON COLUMN profiles.linkedin_connected IS 'Whether user has connected their LinkedIn account';
COMMENT ON COLUMN profiles.google_calendar_enabled IS 'Whether user has enabled Google Calendar sync';
COMMENT ON COLUMN profiles.google_calendar_id IS 'Google Calendar ID for scheduling events';
