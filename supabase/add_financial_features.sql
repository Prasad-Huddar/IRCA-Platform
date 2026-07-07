-- ============================================================================
-- FINANCIAL TRACKING UPDATE
-- ============================================================================

-- 1. Add daily_cost to sobriety_tracker (to calculate savings)
ALTER TABLE sobriety_tracker
ADD COLUMN IF NOT EXISTS daily_cost DECIMAL(10, 2) DEFAULT 0.00;

-- 2. Update RPC initialize_sobriety_tracker to accept daily_cost
DROP FUNCTION IF EXISTS initialize_sobriety_tracker(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION initialize_sobriety_tracker(
  user_id_input TEXT,
  addiction_type_input TEXT,
  start_date_input TEXT,
  daily_cost_input NUMERIC DEFAULT 0
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
    relapses_count,
    daily_cost
  )
  VALUES (
    u_id,
    addiction_type_input,
    s_date,
    true,
    0,
    0,
    0,
    0,
    daily_cost_input
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 3. Create function to Stop Tracker (Update endDate and isActive)
CREATE OR REPLACE FUNCTION stop_sobriety_tracker(
  tracker_id_input TEXT,
  end_date_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  t_id UUID;
  e_date TIMESTAMPTZ;
BEGIN
  t_id := tracker_id_input::UUID;
  e_date := end_date_input::TIMESTAMPTZ;

  UPDATE sobriety_tracker
  SET 
    is_active = false,
    end_date = e_date,
    updated_at = NOW()
  WHERE id = t_id;

  RETURN FOUND;
END;
$$;

-- 4. Create function to Calculate Savings (Dynamic Calculation)
-- This allows the frontend to request current savings based on time elapsed
CREATE OR REPLACE FUNCTION calculate_savings(
  tracker_id_input TEXT
)
RETURNS DECIMAL(12, 2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  t_id UUID;
  savings DECIMAL(12, 2);
  tracker_record RECORD;
  days_elapsed NUMERIC;
BEGIN
  t_id := tracker_id_input::UUID;

  SELECT * INTO tracker_record FROM sobriety_tracker WHERE id = t_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate days elapsed. If active, use NOW(), else use end_date
  IF tracker_record.is_active THEN
    days_elapsed := EXTRACT(EPOCH FROM (NOW() - tracker_record.start_date)) / 86400;
  ELSE
    days_elapsed := EXTRACT(EPOCH FROM (tracker_record.end_date - tracker_record.start_date)) / 86400;
  END IF;

  -- Only count savings for full days? OR fractional? Requirement says "only completed 24 hours".
  -- So we FLOOR users' days.
  days_elapsed := FLOOR(days_elapsed);
  
  IF days_elapsed < 0 THEN
    days_elapsed := 0;
  END IF;

  savings := days_elapsed * tracker_record.daily_cost;
  
  RETURN savings;
END;
$$;

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION initialize_sobriety_tracker TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION stop_sobriety_tracker TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_savings TO anon, authenticated, service_role;
