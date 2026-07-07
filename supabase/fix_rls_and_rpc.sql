-- Function to safely check if an email exists without exposing user data
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin)
SET search_path = public, extensions -- Secure search path
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM end_users WHERE email = email_to_check);
END;
$$;

-- Enable RLS on end_users if not already enabled
ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own data" ON end_users;
DROP POLICY IF EXISTS "Users can update own data" ON end_users;
DROP POLICY IF EXISTS "Allow public user registration" ON end_users;
DROP POLICY IF EXISTS "Service role full access" ON end_users;

-- Re-create policies with correct syntax

-- 1. Users can read their own data
CREATE POLICY "Users can view own data" ON end_users
FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own data
CREATE POLICY "Users can update own data" ON end_users
FOR UPDATE USING (auth.uid() = id);

-- 3. Allow public user registration (INSERT)
-- This allows ANYONE (anon or auth) to insert a row
CREATE POLICY "Allow public user registration" ON end_users
FOR INSERT WITH CHECK (true);

-- 4. Service role full access
CREATE POLICY "Service role full access" ON end_users
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
