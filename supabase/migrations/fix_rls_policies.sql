-- Fix Row Level Security (RLS) policies for profiles and posts tables
-- This allows users to read and write their own data

-- =====================================================
-- PROFILES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- POSTS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own posts
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own posts
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- SERVICE ROLE POLICIES (for server-side operations)
-- =====================================================

-- Allow service role to do everything on profiles
CREATE POLICY "Service role can do anything on profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to do everything on posts
CREATE POLICY "Service role can do anything on posts"
ON posts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
