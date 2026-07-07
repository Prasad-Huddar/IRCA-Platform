-- ============================================================================
-- FINAL AUTH FIX SCRIPT
-- ============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Reset policies on end_users to ensure clean state
ALTER TABLE end_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own data" ON end_users;
DROP POLICY IF EXISTS "Users can update own data" ON end_users;
DROP POLICY IF EXISTS "Allow public user registration" ON end_users;
DROP POLICY IF EXISTS "Service role full access" ON end_users;

-- 3. Enable RLS
ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Allow ANYONE to insert (Registration)
CREATE POLICY "Allow public user registration" ON end_users
FOR INSERT 
WITH CHECK (true);

-- Allow Users to view their own data (only works if they are authenticated with matching ID)
CREATE POLICY "Users can view own data" ON end_users
FOR SELECT 
USING (auth.uid() = id);

-- Allow Users to update their own data
CREATE POLICY "Users can update own data" ON end_users
FOR UPDATE 
USING (auth.uid() = id);

-- Allow Service Role (Admin) full access
CREATE POLICY "Service role full access" ON end_users
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');


-- 5. Create Secure RPC Functions to bypass RLS for specific operations

-- Function to check if email exists (Safe for public)
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as admin
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM end_users WHERE email = email_to_check);
END;
$$;

-- Function to get user auth details safely (Required for Login flow)
-- This is needed because 'anon' users cannot SELECT from end_users to get the password_hash
CREATE OR REPLACE FUNCTION get_user_by_email(email_input TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  password_hash TEXT,
  is_active BOOLEAN,
  is_verified BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as admin
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY 
  SELECT t.id, t.email, t.password_hash, t.is_active, t.is_verified, t.created_at 
  FROM end_users t 
  WHERE t.email = email_input;
END;
$$;

-- 6. Grant Permissions (Crucial for 401/403 errors)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE end_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE user_profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE user_sessions TO anon, authenticated, service_role;

