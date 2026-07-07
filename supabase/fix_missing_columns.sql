-- ============================================================================
-- SCHEMA REPAIR: ADD MISSING COLUMNS
-- ============================================================================
-- The error "column 'addiction_type' does not exist" indicates that the table
-- exists but is using an older schema version. 'CREATE TABLE IF NOT EXISTS'
-- does not update existing tables. We must explicitly ADD the columns.
-- ============================================================================

-- 1. Fix 'sobriety_tracker' table
ALTER TABLE sobriety_tracker 
ADD COLUMN IF NOT EXISTS addiction_type TEXT DEFAULT 'alcohol';

ALTER TABLE sobriety_tracker
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

ALTER TABLE sobriety_tracker
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Fix 'daily_tracking_log' table
ALTER TABLE daily_tracking_log 
ADD COLUMN IF NOT EXISTS addiction_type TEXT DEFAULT 'alcohol';

ALTER TABLE daily_tracking_log
ADD COLUMN IF NOT EXISTS relapse_notes TEXT;

ALTER TABLE daily_tracking_log
ADD COLUMN IF NOT EXISTS relapse_triggers TEXT[];

ALTER TABLE daily_tracking_log
ADD COLUMN IF NOT EXISTS coping_strategies_used TEXT[];

ALTER TABLE daily_tracking_log
ADD COLUMN IF NOT EXISTS support_received TEXT[];

ALTER TABLE daily_tracking_log
ADD COLUMN IF NOT EXISTS triggers_experienced TEXT[];

ALTER TABLE daily_tracking_log
ADD COLUMN IF NOT EXISTS challenges_faced TEXT;

-- 3. Fix 'user_profiles' table (just in case)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS daily_spending_goal DECIMAL(10, 2) DEFAULT 0.00;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS recovery_start_date TIMESTAMPTZ;

-- 4. Verify RLS policies are still valid (Optional but good practice)
-- (No action needed, existing policies should persist)

-- 5. Grant permissions again to be safe
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
