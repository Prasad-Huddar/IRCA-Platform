-- ============================================================================
-- User Profile and Sobriety Tracker Database Schema - IRCA Platform
-- ============================================================================
-- Comprehensive schema for user profiles, sobriety tracking, and financial analytics
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE UNIQUE NOT NULL,
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
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "tracker_visibility": "private"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE,
  account_status TEXT DEFAULT 'active'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles((first_name || ' ' || last_name));
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(account_status);

-- ============================================================================
-- 2. SOBRIETY TRACKER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sobriety_tracker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  addiction_type TEXT DEFAULT 'alcohol', -- 'alcohol', 'drugs', 'gambling', 'smoking', etc.
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sobriety_tracker_user_id ON sobriety_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_sobriety_tracker_active ON sobriety_tracker(user_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 3. FINANCIAL SAVINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS financial_savings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  daily_amount DECIMAL(10, 2) NOT NULL,
  cumulative_savings DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_savings_user_id ON financial_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_savings_date ON financial_savings(user_id, date);

-- ============================================================================
-- 4. SOBRIETY MILESTONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sobriety_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'custom'
  days_achieved INTEGER NOT NULL,
  date_achieved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  financial_savings DECIMAL(12, 2),
  achievement_badge TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sobriety_milestones_user_id ON sobriety_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_sobriety_milestones_type ON sobriety_milestones(user_id, milestone_type);
CREATE INDEX IF NOT EXISTS idx_sobriety_milestones_date ON sobriety_milestones(user_id, date_achieved);

-- ============================================================================
-- 5. DAILY TRACKING LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_tracking_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  addiction_type TEXT DEFAULT 'alcohol', -- 'alcohol', 'drugs', 'gambling', 'smoking', etc.
  log_date DATE NOT NULL,
  sobriety_status BOOLEAN DEFAULT TRUE,
  relapse_occurred BOOLEAN DEFAULT FALSE,
  relapse_triggers TEXT[], -- Specific triggers that led to relapse
  relapse_notes TEXT, -- Detailed notes about the relapse
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  triggers_experienced TEXT[],
  coping_strategies_used TEXT[],
  support_received TEXT[],
  challenges_faced TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_tracking_log_user_id ON daily_tracking_log(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_log_date ON daily_tracking_log(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_log_status ON daily_tracking_log(user_id, sobriety_status, log_date);

-- ============================================================================
-- 6. ACHIEVEMENT BADGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  achievement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  badge_category TEXT NOT NULL, -- 'sobriety', 'financial', 'consistency', 'community'
  badge_level TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievement_badges_user_id ON achievement_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_badges_category ON achievement_badges(user_id, badge_category);

-- ============================================================================
-- 7. USER GOALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL, -- 'sobriety', 'financial', 'personal', 'health'
  goal_description TEXT NOT NULL,
  target_value DECIMAL(10, 2),
  target_date TIMESTAMP WITH TIME ZONE,
  current_progress DECIMAL(10, 2) DEFAULT 0,
  progress_unit TEXT, -- 'days', 'amount', 'percentage'
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(user_id, is_completed);

-- ============================================================================
-- 8. AUDIT LOG TABLE (For Historical Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'profile_update', 'tracker_start', 'tracker_stop', 'goal_created', 'milestone_achieved'
  action_details JSONB NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_type ON user_audit_log(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_date ON user_audit_log(user_id, created_at);

-- ============================================================================
-- 9. DATA BACKUP TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_backup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES end_users(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL, -- 'profile', 'tracker', 'financial', 'complete'
  backup_data JSONB NOT NULL,
  backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_automatic BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_backup_user_id ON data_backup(user_id);
CREATE INDEX IF NOT EXISTS idx_data_backup_type ON data_backup(user_id, backup_type);

-- ============================================================================
-- 10. Create Functions and Triggers
-- ============================================================================

-- Function to update user profile timestamp
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user profile updates
CREATE TRIGGER trigger_update_user_profile_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profile_timestamp();

-- Function to update sobriety tracker timestamp
CREATE OR REPLACE FUNCTION update_sobriety_tracker_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sobriety tracker updates
CREATE TRIGGER trigger_update_sobriety_tracker_timestamp
BEFORE UPDATE ON sobriety_tracker
FOR EACH ROW
EXECUTE FUNCTION update_sobriety_tracker_timestamp();

-- Function to update daily tracking log timestamp
CREATE OR REPLACE FUNCTION update_daily_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for daily tracking updates
CREATE TRIGGER trigger_update_daily_tracking_timestamp
BEFORE UPDATE ON daily_tracking_log
FOR EACH ROW
EXECUTE FUNCTION update_daily_tracking_timestamp();

-- Function to update user goals timestamp
CREATE OR REPLACE FUNCTION update_user_goals_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user goals updates
CREATE TRIGGER trigger_update_user_goals_timestamp
BEFORE UPDATE ON user_goals
FOR EACH ROW
EXECUTE FUNCTION update_user_goals_timestamp();

-- ============================================================================
-- 11. Create Views for Analytics
-- ============================================================================

-- User sobriety statistics view
CREATE OR REPLACE VIEW user_sobriety_stats AS
SELECT
  u.id AS user_id,
  u.email,
  up.first_name,
  up.last_name,
  st.start_date,
  st.current_streak_days,
  st.longest_streak_days,
  st.total_sobriety_days,
  fs.cumulative_savings,
  fs.currency,
  st.is_active,
  st.updated_at AS last_tracker_update
FROM end_users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN sobriety_tracker st ON u.id = st.user_id AND st.is_active = TRUE
LEFT JOIN LATERAL (
  SELECT cumulative_savings, currency
  FROM financial_savings
  WHERE user_id = u.id
  ORDER BY date DESC
  LIMIT 1
) fs ON TRUE;

-- User achievement summary view
CREATE OR REPLACE VIEW user_achievement_summary AS
SELECT
  user_id,
  COUNT(*) AS total_badges,
  SUM(CASE WHEN badge_category = 'sobriety' THEN 1 ELSE 0 END) AS sobriety_badges,
  SUM(CASE WHEN badge_category = 'financial' THEN 1 ELSE 0 END) AS financial_badges,
  SUM(CASE WHEN badge_category = 'consistency' THEN 1 ELSE 0 END) AS consistency_badges,
  SUM(CASE WHEN badge_category = 'community' THEN 1 ELSE 0 END) AS community_badges,
  MAX(CASE WHEN badge_level = 'platinum' THEN 1 ELSE 0 END) AS has_platinum,
  MAX(CASE WHEN badge_level = 'gold' THEN 1 ELSE 0 END) AS has_gold,
  MAX(CASE WHEN badge_level = 'silver' THEN 1 ELSE 0 END) AS has_silver,
  MAX(CASE WHEN badge_level = 'bronze' THEN 1 ELSE 0 END) AS has_bronze
FROM achievement_badges
GROUP BY user_id;

-- ============================================================================
-- 12. Create Materialized Views for Performance
-- ============================================================================

-- Monthly sobriety statistics (refresh daily)
CREATE MATERIALIZED VIEW monthly_sobriety_stats AS
SELECT
  user_id,
  DATE_TRUNC('month', log_date) AS month,
  COUNT(*) AS days_tracked,
  SUM(CASE WHEN sobriety_status = TRUE THEN 1 ELSE 0 END) AS sober_days,
  AVG(mood_rating) AS avg_mood
FROM daily_tracking_log
GROUP BY user_id, DATE_TRUNC('month', log_date);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_monthly_sobriety_stats ON monthly_sobriety_stats(user_id, month);

-- ============================================================================
-- 13. Comments and Documentation
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with recovery tracking information';
COMMENT ON TABLE sobriety_tracker IS 'Core sobriety tracking data with streak management';
COMMENT ON TABLE financial_savings IS 'Daily and cumulative financial savings calculations';
COMMENT ON TABLE sobriety_milestones IS 'Achievement milestones and badge tracking';
COMMENT ON TABLE daily_tracking_log IS 'Daily journal entries and mood tracking';
COMMENT ON TABLE achievement_badges IS 'User achievement badges and rewards';
COMMENT ON TABLE user_goals IS 'Personal recovery goals and progress tracking';
COMMENT ON TABLE user_audit_log IS 'Complete audit trail of all user actions';
COMMENT ON TABLE data_backup IS 'Automatic and manual data backup records';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================