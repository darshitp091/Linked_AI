-- Create support_replies table for ticket conversations
CREATE TABLE IF NOT EXISTS support_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_support_replies_ticket_id ON support_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_replies_created_at ON support_replies(created_at DESC);

-- Enable RLS
ALTER TABLE support_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_replies
-- Users can view replies for their own tickets
CREATE POLICY "Users can view replies for own tickets" ON support_replies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Users can create replies for their own tickets
CREATE POLICY "Users can create replies for own tickets" ON support_replies
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Add RLS policies for support_tickets if not already present
DO $$
BEGIN
  -- Users can view their own tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets'
    AND policyname = 'Users can view own tickets'
  ) THEN
    CREATE POLICY "Users can view own tickets" ON support_tickets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Users can create their own tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets'
    AND policyname = 'Users can create own tickets'
  ) THEN
    CREATE POLICY "Users can create own tickets" ON support_tickets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets'
    AND policyname = 'Users can update own tickets'
  ) THEN
    CREATE POLICY "Users can update own tickets" ON support_tickets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Users can delete their own tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets'
    AND policyname = 'Users can delete own tickets'
  ) THEN
    CREATE POLICY "Users can delete own tickets" ON support_tickets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add indexes for support_tickets if not already present
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Update the support_tickets table to ensure it has the correct status values
DO $$
BEGIN
  -- Drop the old constraint if it exists
  ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check;

  -- Add the new constraint with updated status values
  ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_status_check
    CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed'));
END $$;
