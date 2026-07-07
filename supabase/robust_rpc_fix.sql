-- ============================================================================
-- ROBUST FIX FOR RPC FUNCTIONS
-- ============================================================================
-- This script modifies the RPC functions to accept TEXT inputs for UUIDs and Dates
-- and casts them internally. This prevents "400 Bad Request" errors caused by
-- strict type mismatches between the API layer and Postgres.
-- ============================================================================

-- Drop existing functions to allow signature change
DROP FUNCTION IF EXISTS initialize_sobriety_tracker(UUID, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS create_daily_log(UUID, TEXT, TIMESTAMPTZ, BOOLEAN, BOOLEAN, TEXT[], TEXT);

-- 1. Initialize Sobriety Tracker (Robust)
CREATE OR REPLACE FUNCTION initialize_sobriety_tracker(
  user_id_input TEXT,
  addiction_type_input TEXT,
  start_date_input TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
  u_id UUID;
  s_date TIMESTAMPTZ;
BEGIN
  -- Cast inputs
  u_id := user_id_input::UUID;
  s_date := start_date_input::TIMESTAMPTZ;

  INSERT INTO sobriety_tracker (
    user_id,
    addiction_type,
    start_date,
    is_active,
    current_streak_days,
    longest_streak_days,
    total_sobriety_days,
    relapses_count
  )
  VALUES (
    u_id,
    addiction_type_input,
    s_date,
    true,
    0,
    0,
    0,
    0
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 2. Create Daily Log (Robust)
CREATE OR REPLACE FUNCTION create_daily_log(
  user_id_input TEXT,
  addiction_type_input TEXT,
  log_date_input TEXT,
  sobriety_status_input BOOLEAN,
  relapse_occurred_input BOOLEAN DEFAULT false,
  relapse_triggers_input TEXT[] DEFAULT NULL,
  relapse_notes_input TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
  u_id UUID;
  l_date DATE;
BEGIN
  -- Cast inputs
  u_id := user_id_input::UUID;
  l_date := log_date_input::DATE;

  INSERT INTO daily_tracking_log (
    user_id,
    addiction_type,
    log_date,
    sobriety_status,
    relapse_occurred,
    relapse_triggers,
    relapse_notes
  )
  VALUES (
    u_id,
    addiction_type_input,
    l_date,
    sobriety_status_input,
    relapse_occurred_input,
    relapse_triggers_input,
    relapse_notes_input
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION initialize_sobriety_tracker TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_daily_log TO anon, authenticated, service_role;
