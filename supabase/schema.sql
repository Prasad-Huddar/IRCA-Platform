-- ============================================================================
-- IRCA Platform - Supabase Database Schema
-- ============================================================================
-- This script creates all necessary tables for the IRCA Platform
-- Based on existing TypeScript interfaces from the codebase
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DISTRICTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_districts_name ON districts(name);

-- ============================================================================
-- 2. TALUKAS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS talukas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, district_id)
);

CREATE INDEX idx_talukas_district ON talukas(district_id);
CREATE INDEX idx_talukas_name ON talukas(name);

-- ============================================================================
-- 3. VILLAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  taluka_id UUID NOT NULL REFERENCES talukas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, taluka_id)
);

CREATE INDEX idx_villages_taluka ON villages(taluka_id);
CREATE INDEX idx_villages_name ON villages(name);

-- ============================================================================
-- 4. VILLAGE FACILITY COUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS village_facility_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  village_id UUID NOT NULL UNIQUE REFERENCES villages(id) ON DELETE CASCADE,
  government_irca INTEGER DEFAULT 0,
  private_irca INTEGER DEFAULT 0,
  government_hospital INTEGER DEFAULT 0,
  private_hospital INTEGER DEFAULT 0,
  psychiatrist INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_facility_counts_village ON village_facility_counts(village_id);

-- ============================================================================
-- 5. IRCA CENTERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ircacenters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  beds INTEGER NOT NULL,
  phone TEXT,
  lat FLOAT8,
  lng FLOAT8,
  services TEXT[], -- Array of service strings
  established INTEGER,
  verified BOOLEAN DEFAULT false,
  type TEXT, -- e.g., "Government-Aided IRCA", "Private NGO", etc.
  details TEXT,
  description TEXT,
  village TEXT,
  category TEXT, -- 'government' or 'private'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ircacenters_district ON ircacenters(district);
CREATE INDEX idx_ircacenters_village ON ircacenters(village);
CREATE INDEX idx_ircacenters_category ON ircacenters(category);
CREATE INDEX idx_ircacenters_type ON ircacenters(type);

-- ============================================================================
-- 6. HOSPITALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital TEXT NOT NULL,
  city TEXT NOT NULL,
  details TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('government', 'private')),
  village TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_village ON hospitals(village);
CREATE INDEX idx_hospitals_type ON hospitals(type);

-- ============================================================================
-- 7. PSYCHIATRISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS psychiatrists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  specialty TEXT NOT NULL,
  village TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_psychiatrists_city ON psychiatrists(city);
CREATE INDEX idx_psychiatrists_village ON psychiatrists(village);

-- ============================================================================
-- 8. IRCA CENTER DETAILS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ircacenter_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id TEXT NOT NULL UNIQUE, -- The string ID used for routing (e.g., "irca_dharwad_maitri")
  title TEXT NOT NULL,
  beds TEXT NOT NULL,
  established_year INTEGER NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  location TEXT NOT NULL,
  phone TEXT[] NOT NULL,
  email TEXT NOT NULL,
  overview TEXT NOT NULL,
  services TEXT[] NOT NULL,
  staff JSONB NOT NULL, -- Array of {name, designation, qualification}
  contact JSONB NOT NULL, -- {operating_hours, website, helpline}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ircacenter_details_center_id ON ircacenter_details(center_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE talukas ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_facility_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ircacenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychiatrists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ircacenter_details ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access on districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on talukas" ON talukas FOR SELECT USING (true);
CREATE POLICY "Allow public read access on villages" ON villages FOR SELECT USING (true);
CREATE POLICY "Allow public read access on village_facility_counts" ON village_facility_counts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ircacenters" ON ircacenters FOR SELECT USING (true);
CREATE POLICY "Allow public read access on hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public read access on psychiatrists" ON psychiatrists FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ircacenter_details" ON ircacenter_details FOR SELECT USING (true);

-- Allow public insert access for data migration (can be removed after migration)
CREATE POLICY "Allow public insert on districts" ON districts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on talukas" ON talukas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on villages" ON villages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on village_facility_counts" ON village_facility_counts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on ircacenters" ON ircacenters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on hospitals" ON hospitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on psychiatrists" ON psychiatrists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on ircacenter_details" ON ircacenter_details FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_talukas_updated_at BEFORE UPDATE ON talukas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON villages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facility_counts_updated_at BEFORE UPDATE ON village_facility_counts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ircacenters_updated_at BEFORE UPDATE ON ircacenters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_psychiatrists_updated_at BEFORE UPDATE ON psychiatrists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ircacenter_details_updated_at BEFORE UPDATE ON ircacenter_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
