-- ============================================================================
-- FEEDBACK TABLE MIGRATION
-- ============================================================================
-- This script creates the feedback table for storing user feedback submissions
-- ============================================================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('feedback', 'complaint', 'testimonial', 'suggestion', 'appreciation')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  testimonial_consent BOOLEAN DEFAULT false,
  anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_feedback_reference_id ON feedback(reference_id);
CREATE INDEX idx_feedback_email ON feedback(email);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to insert feedback (public submissions)
CREATE POLICY "Allow public insert on feedback" ON feedback FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read all feedback (for admin purposes)
CREATE POLICY "Allow authenticated read on feedback" ON feedback FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update feedback (for admin purposes)
CREATE POLICY "Allow authenticated update on feedback" ON feedback FOR UPDATE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate unique reference ID
CREATE OR REPLACE FUNCTION generate_feedback_reference_id()
RETURNS TEXT AS $$
DECLARE
  new_ref_id TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_ref_id := 'IRCA-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    
    -- Check if this reference ID already exists
    IF NOT EXISTS (SELECT 1 FROM feedback WHERE reference_id = new_ref_id) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique reference ID after 100 attempts';
    END IF;
  END LOOP;
  
  RETURN new_ref_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to submit feedback with automatic reference ID generation
CREATE OR REPLACE FUNCTION submit_feedback(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_feedback_type TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_testimonial_consent BOOLEAN DEFAULT false,
  p_anonymous BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  reference_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  feedback_type TEXT,
  subject TEXT,
  message TEXT,
  testimonial_consent BOOLEAN,
  anonymous BOOLEAN,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_reference_id TEXT;
BEGIN
  -- Generate unique reference ID
  v_reference_id := generate_feedback_reference_id();
  
  -- Insert the feedback
  INSERT INTO feedback (
    reference_id,
    name,
    email,
    phone,
    feedback_type,
    subject,
    message,
    testimonial_consent,
    anonymous
  ) VALUES (
    v_reference_id,
    p_name,
    p_email,
    p_phone,
    p_feedback_type,
    p_subject,
    p_message,
    p_testimonial_consent,
    p_anonymous
  ) RETURNING 
    id,
    reference_id,
    name,
    email,
    phone,
    feedback_type,
    subject,
    message,
    testimonial_consent,
    anonymous,
    status,
    created_at INTO 
    id,
    reference_id,
    name,
    email,
    phone,
    feedback_type,
    subject,
    message,
    testimonial_consent,
    anonymous,
    status,
    created_at;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
