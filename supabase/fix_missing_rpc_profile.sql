-- ============================================================================
-- FIX MISSING RPC: get_user_profile
-- ============================================================================
-- The 404 error explicitly means the function 'get_user_profile' does NOT exist 
-- in the schema, even though we thought it did.
-- The 406 error confirms RLS blocks direct access.
-- We must recreate this function.

CREATE OR REPLACE FUNCTION get_user_profile(
  user_id_input TEXT
)
RETURNS SETOF user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_profiles
  WHERE user_id = user_id_input::UUID;
END;
$$;

-- Grant permissions to make it accessible
GRANT EXECUTE ON FUNCTION get_user_profile(TEXT) TO anon, authenticated, service_role;

-- Also verify insert_user_profile exists as it might be needed for backup
CREATE OR REPLACE FUNCTION insert_user_profile(
  user_id_input TEXT,
  first_name_input TEXT,
  last_name_input TEXT,
  email_input TEXT,
  phone_input TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO user_profiles (user_id, first_name, last_name, email, phone)
  VALUES (user_id_input::UUID, first_name_input, last_name_input, email_input, phone_input)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_user_profile TO anon, authenticated, service_role;
