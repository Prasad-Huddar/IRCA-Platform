-- ============================================================================
-- SQL SOLUTION: Secure RPC for User Creation (Bypasses RLS)
-- ============================================================================

-- Function to create a user securely efficiently bypassing RLS policies
CREATE OR REPLACE FUNCTION create_new_user(
  email_input TEXT,
  password_hash_input TEXT,
  verification_token_input TEXT
)
RETURNS UUID -- Returns the new ID
LANGUAGE plpgsql
SECURITY DEFINER -- IMPORTANT: Runs with admin privileges
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO end_users (
    email, 
    password_hash, 
    verification_token, 
    is_active, 
    is_verified
  )
  VALUES (
    email_input, 
    password_hash_input, 
    verification_token_input, 
    true, 
    false
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Grant execute permission to everyone (anon and auth)
GRANT EXECUTE ON FUNCTION create_new_user TO anon, authenticated, service_role;
