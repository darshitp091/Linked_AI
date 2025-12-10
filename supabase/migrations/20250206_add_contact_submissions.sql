-- Migration: Add contact submissions table
-- Stores all contact form submissions for record keeping

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'pending', -- pending, responded, closed
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_user_id ON contact_submissions(user_id);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own contact submissions" ON contact_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from users';
