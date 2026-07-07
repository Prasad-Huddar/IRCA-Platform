-- ============================================================================
-- MASTER FIX FOR PROFILE UPDATE (CUSTOM AUTH)
-- ============================================================================

-- 1. Create a secure Update function
CREATE OR REPLACE FUNCTION update_user_profile_secure(
  user_id_input TEXT,
  first_name_input TEXT,
  last_name_input TEXT,
  phone_input TEXT,
  bio_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  updated_row JSONB;
BEGIN
  UPDATE user_profiles
  SET 
    first_name = COALESCE(first_name_input, first_name),
    last_name = COALESCE(last_name_input, last_name),
    phone = COALESCE(phone_input, phone),
    bio = COALESCE(bio_input, bio),
    updated_at = NOW()
  WHERE user_id = user_id_input::UUID
  RETURNING to_jsonb(user_profiles.*) INTO updated_row;
  
  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION update_user_profile_secure TO anon, authenticated, service_role;
