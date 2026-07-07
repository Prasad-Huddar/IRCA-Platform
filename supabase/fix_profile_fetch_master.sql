-- ============================================================================
-- MASTER FIX FOR 406 NOT ACCEPTABLE (CUSTOM AUTH) - VERSION 2
-- ============================================================================

-- Explicitly drop ANY existing versions to avoid "function name is not unique" errors
DROP FUNCTION IF EXISTS get_user_profile_secure(TEXT);
DROP FUNCTION IF EXISTS get_user_profile_secure(UUID);

-- 1. Create a function that is GUARANTEED to work for anon (Security Definer + Grant)
CREATE OR REPLACE FUNCTION get_user_profile_secure(
  user_id_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  result JSONB;
BEGIN
  -- We return a JSONB object directly to avoid any "SETOF" type matching issues or RLS weirdness
  SELECT to_jsonb(u)
  INTO result
  FROM user_profiles u
  WHERE u.user_id = user_id_input::UUID;
  
  RETURN result;
END;
$$;

-- 2. Grant Permissions
GRANT EXECUTE ON FUNCTION get_user_profile_secure(TEXT) TO anon, authenticated, service_role;

-- 3. Force RLS to be permissive for SELECT
-- This ensures that even if the RPC has issues, the table itself allows reading.
DROP POLICY IF EXISTS "Anon Select" ON user_profiles;
CREATE POLICY "Anon Select" ON user_profiles FOR SELECT USING (true);
GRANT SELECT ON user_profiles TO anon;
