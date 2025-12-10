-- Migration: Add support for multiple LinkedIn accounts per user
-- This allows users to connect multiple LinkedIn profiles based on their subscription plan
-- Free: 1 account, Pro: 5 accounts, Standard: 10 accounts, Custom: unlimited

-- Create LinkedIn Accounts table
CREATE TABLE IF NOT EXISTS linkedin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

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
  is_primary BOOLEAN DEFAULT FALSE, -- One account must be primary
  last_synced_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, linkedin_user_id), -- Prevent duplicate accounts
  CHECK (linkedin_user_id IS NOT NULL AND linkedin_user_id != '')
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_user_id ON linkedin_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_active ON linkedin_accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_primary ON linkedin_accounts(user_id, is_primary);

-- Add account_limit field to profiles table to track plan limits
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS linkedin_accounts_limit INTEGER DEFAULT 1;

-- Update existing users to have default limit of 1
UPDATE profiles
SET linkedin_accounts_limit = 1
WHERE linkedin_accounts_limit IS NULL;

-- Migrate existing LinkedIn connections to new table
-- This preserves existing LinkedIn connections
INSERT INTO linkedin_accounts (
  user_id,
  linkedin_user_id,
  linkedin_access_token,
  linkedin_refresh_token,
  linkedin_token_expires_at,
  linkedin_profile_url,
  is_active,
  is_primary,
  created_at,
  updated_at
)
SELECT
  id as user_id,
  linkedin_user_id,
  linkedin_access_token,
  linkedin_refresh_token,
  linkedin_token_expires_at,
  linkedin_profile_url,
  TRUE as is_active,
  TRUE as is_primary, -- Make existing connection primary
  created_at,
  updated_at
FROM profiles
WHERE linkedin_connected = TRUE
  AND linkedin_user_id IS NOT NULL
  AND linkedin_access_token IS NOT NULL
ON CONFLICT (user_id, linkedin_user_id) DO NOTHING;

-- Add function to ensure only one primary account per user
CREATE OR REPLACE FUNCTION ensure_single_primary_account()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting an account as primary, unset all other primary accounts for this user
  IF NEW.is_primary = TRUE THEN
    UPDATE linkedin_accounts
    SET is_primary = FALSE, updated_at = NOW()
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_primary = TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single primary account
DROP TRIGGER IF EXISTS trigger_ensure_single_primary ON linkedin_accounts;
CREATE TRIGGER trigger_ensure_single_primary
  BEFORE INSERT OR UPDATE ON linkedin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_account();

-- Add function to check account limits based on subscription plan
CREATE OR REPLACE FUNCTION check_linkedin_account_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  account_limit INTEGER;
BEGIN
  -- Get current number of active accounts for this user
  SELECT COUNT(*) INTO current_count
  FROM linkedin_accounts
  WHERE user_id = NEW.user_id AND is_active = TRUE;

  -- Get user's account limit
  SELECT linkedin_accounts_limit INTO account_limit
  FROM profiles
  WHERE id = NEW.user_id;

  -- Check if adding this account would exceed the limit
  IF current_count >= account_limit THEN
    RAISE EXCEPTION 'LinkedIn account limit reached. Current plan allows % account(s).', account_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce account limits
DROP TRIGGER IF EXISTS trigger_check_account_limit ON linkedin_accounts;
CREATE TRIGGER trigger_check_account_limit
  BEFORE INSERT ON linkedin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION check_linkedin_account_limit();

-- Add updated_at trigger for linkedin_accounts
CREATE OR REPLACE FUNCTION update_linkedin_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_linkedin_accounts_timestamp ON linkedin_accounts;
CREATE TRIGGER trigger_update_linkedin_accounts_timestamp
  BEFORE UPDATE ON linkedin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_accounts_updated_at();

-- Row Level Security Policies
ALTER TABLE linkedin_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own LinkedIn accounts
DROP POLICY IF EXISTS "Users can view own linkedin accounts" ON linkedin_accounts;
CREATE POLICY "Users can view own linkedin accounts"
  ON linkedin_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own LinkedIn accounts (subject to limit check)
DROP POLICY IF EXISTS "Users can insert own linkedin accounts" ON linkedin_accounts;
CREATE POLICY "Users can insert own linkedin accounts"
  ON linkedin_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own LinkedIn accounts
DROP POLICY IF EXISTS "Users can update own linkedin accounts" ON linkedin_accounts;
CREATE POLICY "Users can update own linkedin accounts"
  ON linkedin_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own LinkedIn accounts
DROP POLICY IF EXISTS "Users can delete own linkedin accounts" ON linkedin_accounts;
CREATE POLICY "Users can delete own linkedin accounts"
  ON linkedin_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Add linkedin_account_id to posts table to track which account was used
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS linkedin_account_id UUID REFERENCES linkedin_accounts(id) ON DELETE SET NULL;

-- Create index for posts by linkedin account
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_account ON posts(linkedin_account_id);

-- Comment explaining the migration
COMMENT ON TABLE linkedin_accounts IS 'Stores multiple LinkedIn accounts per user. Account limits: Free=1, Pro=5, Standard=10, Custom=unlimited';
COMMENT ON COLUMN profiles.linkedin_accounts_limit IS 'Maximum number of LinkedIn accounts allowed based on subscription plan';
