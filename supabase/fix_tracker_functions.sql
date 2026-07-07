-- ============================================================================
-- RPC FUNCTIONS FOR PROFILE & TRACKER SERVICE
-- ============================================================================
-- These functions bypass RLS to allow custom auth users to access their data
-- ============================================================================

-- 1. Initialize Sobriety Tracker
CREATE OR REPLACE FUNCTION initialize_sobriety_tracker(
  user_id_input UUID,
  addiction_type_input TEXT,
  start_date_input TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
BEGIN
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
    user_id_input,
    addiction_type_input,
    start_date_input,
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

-- 2. Get Sobriety Tracker
CREATE OR REPLACE FUNCTION get_sobriety_tracker(
  user_id_input UUID,
  addiction_type_input TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  addiction_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN,
  current_streak_days INTEGER,
  longest_streak_days INTEGER,
  total_sobriety_days INTEGER,
  relapses_count INTEGER,
  last_relapse_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.user_id, t.addiction_type, t.start_date, t.end_date,
    t.is_active, t.current_streak_days, t.longest_streak_days,
    t.total_sobriety_days, t.relapses_count, t.last_relapse_date,
    t.notes, t.created_at, t.updated_at
  FROM sobriety_tracker t
  WHERE t.user_id = user_id_input 
  AND t.addiction_type = addiction_type_input
  ORDER BY t.created_at DESC
  LIMIT 1;
END;
$$;

-- 3. Get All Sobriety Trackers
CREATE OR REPLACE FUNCTION get_all_trackers(
  user_id_input UUID
)
RETURNS SETOF sobriety_tracker
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM sobriety_tracker
  WHERE user_id = user_id_input
  ORDER BY addiction_type ASC;
END;
$$;

-- 4. Create Daily Tracking Log
CREATE OR REPLACE FUNCTION create_daily_log(
  user_id_input UUID,
  addiction_type_input TEXT,
  log_date_input TIMESTAMPTZ,
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
BEGIN
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
    user_id_input,
    addiction_type_input,
    log_date_input,
    sobriety_status_input,
    relapse_occurred_input,
    relapse_triggers_input,
    relapse_notes_input
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION initialize_sobriety_tracker TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_sobriety_tracker TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_all_trackers TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_daily_log TO anon, authenticated, service_role;

-- Special: Grant SELECT on sobriety_tracker so client can return types matching the table
GRANT SELECT ON TABLE sobriety_tracker TO anon, authenticated, service_role;
