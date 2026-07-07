-- ============================================================================
// Row Level Security Policies for Auth Tables - IRCA Platform
-- ============================================================================
// This script creates RLS policies for user authentication and profile tables
// to fix 406 "Not Acceptable" errors
-- ============================================================================

// ============================================================================
// Enable RLS on auth tables
-- ============================================================================
ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sobriety_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sobriety_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backup ENABLE ROW LEVEL SECURITY;

// ============================================================================
// Policies for end_users table
-- ============================================================================
// Users can read their own data
CREATE POLICY "Users can view own data" ON end_users
FOR SELECT USING (auth.uid() = id);

// Users can update their own data
CREATE POLICY "Users can update own data" ON end_users
FOR UPDATE USING (auth.uid() = id);

// Allow unauthenticated inserts for user registration
CREATE POLICY "Allow public user registration" ON end_users
FOR INSERT WITH CHECK (true);

// Allow service role full access for admin operations
CREATE POLICY "Service role full access" ON end_users
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

// ============================================================================
// Policies for user_profiles table
-- ============================================================================
// Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own profile (soft delete)
CREATE POLICY "Users can delete own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = user_id);

// ============================================================================
// Policies for user_sessions table
-- ============================================================================
// Users can read their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions 
FOR SELECT USING (auth.uid() = user_id);

// Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON user_sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions 
FOR UPDATE USING (auth.uid() = user_id);

// ============================================================================
// Policies for sobriety_tracker table
-- ============================================================================
// Users can read their own sobriety trackers
CREATE POLICY "Users can view own trackers" ON sobriety_tracker 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own sobriety trackers
CREATE POLICY "Users can update own trackers" ON sobriety_tracker 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own sobriety trackers
CREATE POLICY "Users can insert own trackers" ON sobriety_tracker 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own sobriety trackers
CREATE POLICY "Users can delete own trackers" ON sobriety_tracker 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Policies for financial_savings table
-- ============================================================================
// Users can read their own financial savings
CREATE POLICY "Users can view own savings" ON financial_savings 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own financial savings
CREATE POLICY "Users can update own savings" ON financial_savings 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own financial savings
CREATE POLICY "Users can insert own savings" ON financial_savings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own financial savings
CREATE POLICY "Users can delete own savings" ON financial_savings 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Policies for sobriety_milestones table
-- ============================================================================
// Users can read their own milestones
CREATE POLICY "Users can view own milestones" ON sobriety_milestones 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own milestones
CREATE POLICY "Users can update own milestones" ON sobriety_milestones 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own milestones
CREATE POLICY "Users can insert own milestones" ON sobriety_milestones 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own milestones
CREATE POLICY "Users can delete own milestones" ON sobriety_milestones 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Policies for daily_tracking_log table
-- ============================================================================
// Users can read their own daily tracking logs
CREATE POLICY "Users can view own tracking logs" ON daily_tracking_log 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own daily tracking logs
CREATE POLICY "Users can update own tracking logs" ON daily_tracking_log 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own daily tracking logs
CREATE POLICY "Users can insert own tracking logs" ON daily_tracking_log 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own daily tracking logs
CREATE POLICY "Users can delete own tracking logs" ON daily_tracking_log 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Policies for achievement_badges table
-- ============================================================================
// Users can read their own achievement badges
CREATE POLICY "Users can view own badges" ON achievement_badges 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own achievement badges
CREATE POLICY "Users can update own badges" ON achievement_badges 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own achievement badges
CREATE POLICY "Users can insert own badges" ON achievement_badges 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own achievement badges
CREATE POLICY "Users can delete own badges" ON achievement_badges 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Policies for user_goals table
-- ============================================================================
// Users can read their own goals
CREATE POLICY "Users can view own goals" ON user_goals 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own goals
CREATE POLICY "Users can update own goals" ON user_goals 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own goals
CREATE POLICY "Users can insert own goals" ON user_goals 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own goals
CREATE POLICY "Users can delete own goals" ON user_goals 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Policies for user_audit_log table
-- ============================================================================
// Users can read their own audit logs
CREATE POLICY "Users can view own audit logs" ON user_audit_log 
FOR SELECT USING (auth.uid() = user_id);

// Users can insert their own audit logs
CREATE POLICY "Users can insert own audit logs" ON user_audit_log 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// ============================================================================
// Policies for data_backup table
-- ============================================================================
// Users can read their own data backups
CREATE POLICY "Users can view own backups" ON data_backup 
FOR SELECT USING (auth.uid() = user_id);

// Users can update their own data backups
CREATE POLICY "Users can update own backups" ON data_backup 
FOR UPDATE USING (auth.uid() = user_id);

// Users can insert their own data backups
CREATE POLICY "Users can insert own backups" ON data_backup 
FOR INSERT WITH CHECK (auth.uid() = user_id);

// Users can delete their own data backups
CREATE POLICY "Users can delete own backups" ON data_backup 
FOR DELETE USING (auth.uid() = user_id);

// ============================================================================
// Service role policies (for system operations)
// ============================================================================
// Allow service role full access to all tables for admin operations
CREATE POLICY "Service role full access on end_users" ON end_users 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on user_profiles" ON user_profiles 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on sobriety_tracker" ON sobriety_tracker 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on financial_savings" ON financial_savings 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on sobriety_milestones" ON sobriety_milestones 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on daily_tracking_log" ON daily_tracking_log 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on achievement_badges" ON achievement_badges 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on user_goals" ON user_goals 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on user_audit_log" ON user_audit_log 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on data_backup" ON data_backup 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

// ============================================================================
// END OF RLS POLICIES
-- ============================================================================