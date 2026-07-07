-- ============================================================================
-- MASTER FIX: TABLES AND FUNCTIONS
-- ============================================================================
-- Run this script to ensure all necessary tables and functions exist.
-- This combined script fixes the "Failed to initialize" errors by ensuring
-- the underlying schema is present and the RPC functions are strictly defined.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES (Safe to run if they already exist)

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  date_of_birth DATE,
  gender TEXT,
  profile_picture_url TEXT,
  bio TEXT,
  recovery_start_date TIMESTAMP WITH TIME ZONE,
  daily_spending_goal DECIMAL(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  account_status TEXT DEFAULT 'active'
);

-- Sobriety Tracker
CREATE TABLE IF NOT EXISTS sobriety_tracker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  addiction_type TEXT DEFAULT 'alcohol',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_sobriety_days INTEGER DEFAULT 0,
  relapses_count INTEGER DEFAULT 0,
  last_relapse_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Tracking Log
CREATE TABLE IF NOT EXISTS daily_tracking_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  addiction_type TEXT DEFAULT 'alcohol',
  log_date DATE NOT NULL,
  sobriety_status BOOLEAN DEFAULT TRUE,
  relapse_occurred BOOLEAN DEFAULT FALSE,
  relapse_triggers TEXT[],
  relapse_notes TEXT,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  triggers_experienced TEXT[],
  coping_strategies_used TEXT[],
  support_received TEXT[],
  challenges_faced TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Savings
CREATE TABLE IF NOT EXISTS financial_savings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  daily_amount DECIMAL(10, 2) NOT NULL,
  cumulative_savings DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Badges
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  achievement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  badge_category TEXT NOT NULL,
  badge_level TEXT DEFAULT 'bronze',
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sobriety Milestones
CREATE TABLE IF NOT EXISTS sobriety_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL,
  days_achieved INTEGER NOT NULL,
  date_achieved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  financial_savings DECIMAL(12, 2),
  achievement_badge TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE RLS (Just in case)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sobriety_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE sobriety_milestones ENABLE ROW LEVEL SECURITY;

-- 4. GRANT PERMISSIONS (Critical for 406/401 errors)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. RE-CREATE RPC FUNCTIONS (With explicit parameter types)

-- Initialize Sobriety Tracker
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

-- Create Daily Log
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

-- Grant Execute on Functions
GRANT EXECUTE ON FUNCTION initialize_sobriety_tracker TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_daily_log TO anon, authenticated, service_role;

