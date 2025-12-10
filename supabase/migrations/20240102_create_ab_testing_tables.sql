-- =====================================================
-- A/B TESTING SYSTEM TABLES
-- Migration: 20240102_create_ab_testing_tables
-- =====================================================

-- A/B Tests Table
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Test Configuration
  name TEXT NOT NULL,
  description TEXT,
  test_type TEXT DEFAULT 'content' CHECK (test_type IN ('content', 'hashtags', 'cta', 'mixed')),

  -- Status & Timing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_hours INTEGER, -- Auto-end after X hours

  -- Test Settings
  min_sample_size INTEGER DEFAULT 100, -- Minimum views per variant
  confidence_level DECIMAL(3,2) DEFAULT 0.95, -- 95% confidence
  auto_promote_winner BOOLEAN DEFAULT FALSE,
  winner_variant_id UUID,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Test Variants Table (connects to posts table)
CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,

  -- Variant Configuration
  variant_name TEXT NOT NULL, -- 'A', 'B', 'C', etc.
  variant_label TEXT, -- User-friendly label like "Short Form", "With Emoji"
  traffic_percentage INTEGER NOT NULL CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),

  -- Performance Metrics (cached from post_analytics)
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Statistical Analysis
  is_winner BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(5,2), -- Confidence that this is the winner
  statistical_significance BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(ab_test_id, variant_name)
);

-- A/B Test Analytics Snapshots (daily or hourly snapshots)
CREATE TABLE ab_test_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES ab_test_variants(id) ON DELETE CASCADE NOT NULL,

  -- Snapshot timestamp
  snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metrics at this point in time
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Cumulative totals
  cumulative_views INTEGER DEFAULT 0,
  cumulative_likes INTEGER DEFAULT 0,
  cumulative_comments INTEGER DEFAULT 0,
  cumulative_shares INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(ab_test_id, variant_id, snapshot_at)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_created_at ON ab_tests(created_at DESC);

CREATE INDEX idx_ab_test_variants_ab_test_id ON ab_test_variants(ab_test_id);
CREATE INDEX idx_ab_test_variants_post_id ON ab_test_variants(post_id);

CREATE INDEX idx_ab_test_analytics_ab_test_id ON ab_test_analytics(ab_test_id);
CREATE INDEX idx_ab_test_analytics_variant_id ON ab_test_analytics(variant_id);
CREATE INDEX idx_ab_test_analytics_snapshot_at ON ab_test_analytics(snapshot_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_analytics ENABLE ROW LEVEL SECURITY;

-- A/B Tests Policies
CREATE POLICY "Users can view own ab tests"
  ON ab_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ab tests"
  ON ab_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ab tests"
  ON ab_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ab tests"
  ON ab_tests FOR DELETE
  USING (auth.uid() = user_id);

-- Variants Policies
CREATE POLICY "Users can view variants of own tests"
  ON ab_test_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      WHERE ab_tests.id = ab_test_variants.ab_test_id
      AND ab_tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create variants for own tests"
  ON ab_test_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ab_tests
      WHERE ab_tests.id = ab_test_variants.ab_test_id
      AND ab_tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update variants of own tests"
  ON ab_test_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      WHERE ab_tests.id = ab_test_variants.ab_test_id
      AND ab_tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete variants of own tests"
  ON ab_test_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      WHERE ab_tests.id = ab_test_variants.ab_test_id
      AND ab_tests.user_id = auth.uid()
    )
  );

-- Analytics Policies
CREATE POLICY "Users can view analytics of own tests"
  ON ab_test_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      WHERE ab_tests.id = ab_test_analytics.ab_test_id
      AND ab_tests.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ab_test_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_ab_test_updated_at();

CREATE TRIGGER update_ab_test_variants_updated_at
  BEFORE UPDATE ON ab_test_variants
  FOR EACH ROW EXECUTE FUNCTION update_ab_test_updated_at();

-- Function to validate traffic percentages sum to 100
CREATE OR REPLACE FUNCTION validate_traffic_percentages()
RETURNS TRIGGER AS $$
DECLARE
  total_percentage INTEGER;
BEGIN
  SELECT COALESCE(SUM(traffic_percentage), 0)
  INTO total_percentage
  FROM ab_test_variants
  WHERE ab_test_id = NEW.ab_test_id
    AND id != NEW.id;

  IF total_percentage + NEW.traffic_percentage > 100 THEN
    RAISE EXCEPTION 'Total traffic percentage cannot exceed 100%%';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_variant_traffic_percentage
  BEFORE INSERT OR UPDATE ON ab_test_variants
  FOR EACH ROW EXECUTE FUNCTION validate_traffic_percentages();

-- Function to sync variant metrics from post_analytics
CREATE OR REPLACE FUNCTION sync_variant_metrics()
RETURNS void AS $$
BEGIN
  UPDATE ab_test_variants v
  SET
    views = COALESCE(p.views_count, 0),
    likes = COALESCE(p.likes_count, 0),
    comments = COALESCE(p.comments_count, 0),
    shares = COALESCE(p.shares_count, 0),
    engagement_rate = COALESCE(p.engagement_rate, 0)
  FROM posts p
  WHERE v.post_id = p.id
    AND EXISTS (
      SELECT 1 FROM ab_tests t
      WHERE t.id = v.ab_test_id
      AND t.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create analytics snapshot
CREATE OR REPLACE FUNCTION create_ab_test_snapshot(test_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO ab_test_analytics (
    ab_test_id,
    variant_id,
    snapshot_at,
    views,
    likes,
    comments,
    shares,
    clicks,
    engagement_rate,
    cumulative_views,
    cumulative_likes,
    cumulative_comments,
    cumulative_shares
  )
  SELECT
    v.ab_test_id,
    v.id,
    NOW(),
    v.views,
    v.likes,
    v.comments,
    v.shares,
    v.clicks,
    v.engagement_rate,
    v.views,
    v.likes,
    v.comments,
    v.shares
  FROM ab_test_variants v
  WHERE v.ab_test_id = test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: A/B Test Performance Summary
CREATE VIEW ab_test_performance_summary AS
SELECT
  t.id as test_id,
  t.user_id,
  t.name as test_name,
  t.status,
  t.started_at,
  t.ended_at,
  COUNT(v.id) as variant_count,
  SUM(v.views) as total_views,
  SUM(v.likes) as total_likes,
  SUM(v.comments) as total_comments,
  SUM(v.shares) as total_shares,
  AVG(v.engagement_rate) as avg_engagement_rate,
  MAX(v.engagement_rate) as best_engagement_rate,
  (SELECT variant_name FROM ab_test_variants
   WHERE ab_test_id = t.id
   ORDER BY engagement_rate DESC
   LIMIT 1) as leading_variant
FROM ab_tests t
LEFT JOIN ab_test_variants v ON t.id = v.ab_test_id
GROUP BY t.id, t.user_id, t.name, t.status, t.started_at, t.ended_at;
