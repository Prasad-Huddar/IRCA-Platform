-- ============================================================================
-- RPC FUNCTIONS FOR CUSTOM AUTH FLOW
-- ============================================================================
-- Since Supabase RLS relies on auth.uid() which isn't populated for our 
-- custom auth implementation, we need SECURITY DEFINER functions (RPCs) to
-- bypass RLS and perform operations securely on the server side.
-- ============================================================================

-- 1. Create User Session
CREATE OR REPLACE FUNCTION create_user_session(
  user_id_input UUID,
  session_token_input TEXT,
  expires_at_input TIMESTAMPTZ,
  ip_address_input TEXT,
  user_agent_input TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO user_sessions (
    user_id,
    session_token,
    expires_at,
    ip_address,
    user_agent,
    is_active
  )
  VALUES (
    user_id_input,
    session_token_input,
    expires_at_input,
    ip_address_input,
    user_agent_input,
    true
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 2. Create User Profile
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id_input UUID,
  first_name_input TEXT,
  last_name_input TEXT,
  phone_input TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    phone
  )
  VALUES (
    user_id_input,
    first_name_input,
    last_name_input,
    phone_input
  );
END;
$$;

-- 3. Update Last Login
CREATE OR REPLACE FUNCTION update_user_last_login(
  user_id_input UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE end_users
  SET last_login = NOW()
  WHERE id = user_id_input;
END;
$$;

-- 4. Get User Profile (Secure)
CREATE OR REPLACE FUNCTION get_user_profile_secure(
  user_id_input UUID
)
RETURNS TABLE (
  first_name TEXT,
  last_name TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT p.first_name, p.last_name, p.phone
  FROM user_profiles p
  WHERE p.user_id = user_id_input;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_user_session TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_user_last_login TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_profile_secure TO anon, authenticated, service_role;
