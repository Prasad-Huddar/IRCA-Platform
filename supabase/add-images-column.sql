-- ============================================================================
-- Add images column to ircacenter_details table
-- ============================================================================
-- This migration adds support for storing image URLs from Supabase Storage
-- Images will be stored as TEXT[] (array of public URLs)
-- ============================================================================

-- Add images column to store array of image URLs
ALTER TABLE ircacenter_details
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN ircacenter_details.images IS 'Array of Supabase Storage public URLs for center gallery images';

-- Create index for faster queries (optional, but recommended)
CREATE INDEX IF NOT EXISTS idx_ircacenter_details_images ON ircacenter_details USING GIN (images);

-- Allow UPDATE policy for updating images (needed for migration script)
-- Drop existing policy first if it exists, then create new one
DROP POLICY IF EXISTS "Allow public update on ircacenter_details" ON ircacenter_details;

CREATE POLICY "Allow public update on ircacenter_details" 
ON ircacenter_details FOR UPDATE 
USING (true)
WITH CHECK (true);

-- ============================================================================
-- Supabase Storage Configuration
-- ============================================================================
-- Note: Storage buckets must be created manually in Supabase Dashboard or via API
-- Bucket name: irca-center-images
-- Public access: enabled
-- File size limits: 5MB per file
-- Allowed MIME types: image/jpeg, image/png, image/jpg
-- ============================================================================
