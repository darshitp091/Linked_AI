-- Add Google Calendar integration fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS google_calendar_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';

-- Add Google Calendar event ID to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_google_calendar_event_id
ON posts(google_calendar_event_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.google_calendar_enabled IS 'Whether user has enabled Google Calendar sync';
COMMENT ON COLUMN profiles.google_calendar_id IS 'Google Calendar ID to sync posts to (default: primary)';
COMMENT ON COLUMN posts.google_calendar_event_id IS 'Google Calendar event ID if post is synced to calendar';
