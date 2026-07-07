-- ============================================================================
-- IMPROVED STOP LOGIC & INDEPENDENT TRACKING
-- ============================================================================

-- 1. Enhanced Stop Function
-- This function now finalizes the stats for the tracker when it is stopped.
-- It works completely independently of other trackers.
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
  s_date TIMESTAMPTZ;
  days_diff INTEGER;
  final_days NUMERIC;
BEGIN
  t_id := tracker_id_input::UUID;
  e_date := end_date_input::TIMESTAMPTZ;
  
  -- Get start date
  SELECT start_date INTO s_date FROM sobriety_tracker WHERE id = t_id;
  
  -- Calculate total days (floor to ensure full days)
  final_days := EXTRACT(EPOCH FROM (e_date - s_date)) / 86400;
  days_diff := FLOOR(final_days);
  
  IF days_diff < 0 THEN
    days_diff := 0;
  END IF;

  -- Finalize the tracker row
  -- logic: This tracker is done. Save its final performance stats.
  UPDATE sobriety_tracker
  SET 
    is_active = false,
    end_date = e_date,
    updated_at = NOW(),
    current_streak_days = days_diff,
    total_sobriety_days = days_diff, -- Assuming continuous sobriety for this tracker
    longest_streak_days = GREATEST(longest_streak_days, days_diff)
  WHERE id = t_id;
  
  RETURN FOUND;
END;
$$;

-- 2. Add 'daily_cost' column if not exists (Safety check)
-- This ensures independent financial tracking per tracker.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='sobriety_tracker' AND column_name='daily_cost') THEN
        ALTER TABLE sobriety_tracker ADD COLUMN daily_cost DECIMAL(10, 2) DEFAULT 0.00;
    END IF;
END $$;

-- Grant permissions (Safety check)
GRANT EXECUTE ON FUNCTION stop_sobriety_tracker TO anon, authenticated, service_role;
