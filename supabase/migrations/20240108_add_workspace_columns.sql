-- =====================================================
-- Add Missing Columns to Existing Workspace Tables
-- The tables already exist from comprehensive-schema.sql
-- We just need to add the missing columns
-- =====================================================

-- Add missing columns to workspaces table
ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 1;

-- Add missing columns to workspace_members table
ALTER TABLE workspace_members
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have default status if null
UPDATE workspace_members SET status = 'active' WHERE status IS NULL;

-- Create workspace_invitations table (doesn't exist in comprehensive schema)
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);

-- Add workspace_id to posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_plan ON workspaces(plan);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON workspace_members(status);
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON workspace_members(workspace_id, role);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace ON workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_posts_workspace ON posts(workspace_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_workspaces_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_workspace_members_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_workspace_invitations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_owner_workspace_member()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role, status, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active', NOW())
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_owner_removal()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove workspace owner';
  END IF;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_member_limits()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  max_allowed INTEGER;
  current_count INTEGER;
BEGIN
  SELECT max_members INTO max_allowed FROM workspaces WHERE id = NEW.workspace_id;
  SELECT COUNT(*) INTO current_count FROM workspace_members WHERE workspace_id = NEW.workspace_id AND status = 'active';
  IF TG_OP = 'INSERT' AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Workspace member limit reached';
  END IF;
  RETURN NEW;
END;
$$;

-- Helper functions using SQL language
CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_workspace_admin(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id
    AND role IN ('owner', 'admin') AND status = 'active'
  );
$$;

-- Drop old triggers
DROP TRIGGER IF EXISTS trigger_update_workspaces_timestamp ON workspaces;
DROP TRIGGER IF EXISTS trigger_update_workspace_members_timestamp ON workspace_members;
DROP TRIGGER IF EXISTS trigger_update_workspace_invitations_timestamp ON workspace_invitations;
DROP TRIGGER IF EXISTS trigger_create_owner_member ON workspaces;
DROP TRIGGER IF EXISTS trigger_prevent_owner_removal ON workspace_members;
DROP TRIGGER IF EXISTS trigger_enforce_member_limits ON workspace_members;

-- Create triggers
CREATE TRIGGER trigger_update_workspaces_timestamp
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_workspaces_updated_at();

CREATE TRIGGER trigger_update_workspace_members_timestamp
  BEFORE UPDATE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_workspace_members_updated_at();

CREATE TRIGGER trigger_update_workspace_invitations_timestamp
  BEFORE UPDATE ON workspace_invitations
  FOR EACH ROW EXECUTE FUNCTION update_workspace_invitations_updated_at();

CREATE TRIGGER trigger_create_owner_member
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION create_owner_workspace_member();

CREATE TRIGGER trigger_prevent_owner_removal
  BEFORE DELETE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION prevent_owner_removal();

CREATE TRIGGER trigger_enforce_member_limits
  BEFORE INSERT ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION enforce_member_limits();

-- Enable RLS (might already be enabled)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Users can create their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can add members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can update members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can remove members" ON workspace_members;
DROP POLICY IF EXISTS "Members can view invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON workspace_invitations;

-- Create RLS policies
CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces FOR SELECT
  USING (owner_id = auth.uid() OR is_workspace_member(id, auth.uid()));

CREATE POLICY "Users can create their own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Admins can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can update members"
  ON workspace_members FOR UPDATE
  USING (is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can remove members"
  ON workspace_members FOR DELETE
  USING (is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Members can view invitations"
  ON workspace_invitations FOR SELECT
  USING (
    is_workspace_member(workspace_id, auth.uid()) OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can create invitations"
  ON workspace_invitations FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can update invitations"
  ON workspace_invitations FOR UPDATE
  USING (is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete invitations"
  ON workspace_invitations FOR DELETE
  USING (is_workspace_admin(workspace_id, auth.uid()));
