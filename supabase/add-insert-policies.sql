-- ============================================================================
-- Add INSERT Policies for Data Migration
-- ============================================================================
-- Run this script in Supabase SQL Editor to fix RLS permission errors
-- This allows the migration script to insert data into all tables
-- ============================================================================

-- Allow public insert access for data migration
CREATE POLICY "Allow public insert on districts" ON districts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on talukas" ON talukas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on villages" ON villages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on village_facility_counts" ON village_facility_counts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on ircacenters" ON ircacenters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on hospitals" ON hospitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on psychiatrists" ON psychiatrists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on ircacenter_details" ON ircacenter_details FOR INSERT WITH CHECK (true);

-- ============================================================================
-- IMPORTANT: After migration is complete, you can optionally remove these
-- INSERT policies if you don't want public write access
-- ============================================================================
-- Uncomment and run these lines after migration to remove INSERT policies:
/*
DROP POLICY "Allow public insert on districts" ON districts;
DROP POLICY "Allow public insert on talukas" ON talukas;
DROP POLICY "Allow public insert on villages" ON villages;
DROP POLICY "Allow public insert on village_facility_counts" ON village_facility_counts;
DROP POLICY "Allow public insert on ircacenters" ON ircacenters;
DROP POLICY "Allow public insert on hospitals" ON hospitals;
DROP POLICY "Allow public insert on psychiatrists" ON psychiatrists;
DROP POLICY "Allow public insert on ircacenter_details" ON ircacenter_details;
*/
