-- Migration: Update API Keys Table
-- Adds missing columns to existing api_keys table from comprehensive schema

-- Add missing columns to api_keys table if they don't exist
DO $$
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add key_name column (comprehensive schema uses 'name')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'key_name'
  ) THEN
    -- If 'name' column exists, rename it to 'key_name'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'api_keys' AND column_name = 'name'
    ) THEN
      ALTER TABLE api_keys RENAME COLUMN name TO key_name;
    ELSE
      ALTER TABLE api_keys ADD COLUMN key_name TEXT NOT NULL DEFAULT 'API Key';
    END IF;
  END IF;

  -- Add scopes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'scopes'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN scopes TEXT[] DEFAULT ARRAY['posts:read']::TEXT[];
  END IF;

  -- Add last_used_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create API Usage Logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,

  -- Additional data
  request_body JSONB DEFAULT '{}'::jsonb,
  response_body JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_logs(created_at DESC);

-- Updated_at trigger for api_keys
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_api_keys_timestamp ON api_keys;
CREATE TRIGGER trigger_update_api_keys_timestamp
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();

-- Function to auto-deactivate expired keys
CREATE OR REPLACE FUNCTION deactivate_expired_api_keys()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET is_active = FALSE, updated_at = NOW()
  WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (might already be enabled)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own API keys" ON api_keys;
CREATE POLICY "Users can create own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;
CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for api_usage_logs
DROP POLICY IF EXISTS "Users can view own API usage" ON api_usage_logs;
CREATE POLICY "Users can view own API usage"
  ON api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert usage logs" ON api_usage_logs;
CREATE POLICY "Service can insert usage logs"
  ON api_usage_logs FOR INSERT
  WITH CHECK (true);

-- Add check constraint for scopes if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'api_keys_scopes_check'
  ) THEN
    ALTER TABLE api_keys
    ADD CONSTRAINT api_keys_scopes_check
    CHECK (array_length(scopes, 1) > 0);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Constraint might already exist, ignore error
    NULL;
END $$;

-- Comments
COMMENT ON TABLE api_keys IS 'Stores API keys for programmatic access. Keys are hashed for security.';
COMMENT ON TABLE api_usage_logs IS 'Logs all API requests for analytics and rate limiting.';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the full API key for verification';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 10 characters of the key for display purposes';
COMMENT ON COLUMN api_keys.scopes IS 'Array of permission scopes (e.g., posts:read, posts:write)';
COMMENT ON COLUMN api_keys.is_active IS 'Whether the API key is currently active and can be used';
