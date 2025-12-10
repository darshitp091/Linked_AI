-- Migration: API Key Management System
-- Creates tables and policies for API key management

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Key identification
  key_name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 10 chars for display (e.g., "ll_a1b2c3d")
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of full key

  -- Permissions
  scopes TEXT[] DEFAULT '{}' NOT NULL, -- e.g., ['posts:read', 'posts:write']

  -- Status and usage
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (key_name IS NOT NULL AND key_name != ''),
  CHECK (array_length(scopes, 1) > 0) -- At least one scope required
);

-- API Usage Logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL, -- GET, POST, PATCH, DELETE
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(user_id, is_active);
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
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
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

-- Service role can insert usage logs
DROP POLICY IF EXISTS "Service can insert usage logs" ON api_usage_logs;
CREATE POLICY "Service can insert usage logs"
  ON api_usage_logs FOR INSERT
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE api_keys IS 'Stores API keys for programmatic access. Keys are hashed for security.';
COMMENT ON TABLE api_usage_logs IS 'Logs all API requests for analytics and rate limiting.';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the full API key for verification';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 10 characters of the key for display purposes';
COMMENT ON COLUMN api_keys.scopes IS 'Array of permission scopes (e.g., posts:read, posts:write)';
