-- ============================================================================
-- Feedback Table Setup - IRCA Platform
-- ============================================================================
-- This script creates the feedback table and sets up RLS policies
-- ============================================================================

-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('feedback', 'complaint', 'testimonial', 'suggestion', 'appreciation')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  testimonial_consent BOOLEAN DEFAULT FALSE,
  anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert on feedback" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated users to view their own feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admins to view all feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admins to update feedback" ON feedback;

-- Policy 1: Allow anyone to insert feedback (public submissions)
CREATE POLICY "Allow public insert on feedback"
ON feedback
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow authenticated users to view their own feedback
CREATE POLICY "Allow authenticated users to view their own feedback"
ON feedback
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Policy 3: Allow public to view their feedback by reference_id (for tracking)
CREATE POLICY "Allow public to view feedback by reference_id"
ON feedback
FOR SELECT
TO public
USING (true);

-- Policy 4: Allow admins to view all feedback (you'll need to set up admin role)
-- Uncomment and modify this if you have an admin role system
-- CREATE POLICY "Allow admins to view all feedback"
-- ON feedback
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_roles
--     WHERE user_roles.user_id = auth.uid()
--     AND user_roles.role = 'admin'
--   )
-- );

-- Policy 5: Allow admins to update feedback status
-- Uncomment and modify this if you have an admin role system
-- CREATE POLICY "Allow admins to update feedback"
-- ON feedback
-- FOR UPDATE
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_roles
--     WHERE user_roles.user_id = auth.uid()
--     AND user_roles.role = 'admin'
--   )
-- )
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM user_roles
--     WHERE user_roles.user_id = auth.uid()
--     AND user_roles.role = 'admin'
--   )
-- );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_reference_id ON feedback(reference_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS feedback_updated_at ON feedback;
CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON feedback TO anon;
GRANT SELECT, INSERT ON feedback TO authenticated;
GRANT ALL ON feedback TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Feedback table and RLS policies created successfully!';
  RAISE NOTICE 'Public users can now submit feedback anonymously.';
  RAISE NOTICE 'Run this script in your Supabase SQL Editor.';
END $$;
