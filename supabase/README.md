# IRCA Platform - Supabase Database Migration

This directory contains all the necessary scripts to set up and populate the Supabase database for the IRCA Platform.

## 📋 Prerequisites

1. Active Supabase project
2. Supabase URL and anon key configured in the project
3. Node.js and npm installed
4. tsx package for running TypeScript scripts

## 🚀 Migration Steps

### Step 1: Execute Database Schema

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content of `schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** to execute the schema

This will create all 8 tables:
- `districts`
- `talukas`
- `villages`
- `village_facility_counts`
- `ircacenters`
- `hospitals`
- `psychiatrists`
- `ircacenter_details`

### Step 2: Add INSERT Policies for Migration

**IMPORTANT:** Before running the data migration, you need to add INSERT policies to allow the migration script to write data.

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **+ New Query**
3. Copy the entire content of `add-insert-policies.sql`
4. Paste it into the SQL Editor
5. Click **Run**

This allows the migration script to insert data. You can optionally remove these INSERT policies after migration is complete.

### Step 3: Install tsx (if not already installed)

```bash
npm install -D tsx
```

### Step 4: Run Data Migration Script

```bash
npx tsx supabase/migrate-data.ts
```

This script will:
- ✅ Migrate all districts, talukas, and villages from `karnatakaData.ts`
- ✅ Migrate all IRCA centers (government and private) from `centers.ts`
- ✅ Migrate all hospitals (government and private) from `centers.ts`
- ✅ Migrate all psychiatrists from `centers.ts`
- ✅ Migrate all IRCA center details from `irca-centers-data.ts`
- ✅ Populate village facility counts for navigation dropdown

### Step 5: Migrate Images to Supabase Storage (NEW!)

**IMPORTANT:** This step uploads all IRCA center images to Supabase Storage.

1. Run the schema update to add the images column:
   - In Supabase Dashboard, go to **SQL Editor**
   - Copy content from `add-images-column.sql`
   - Click **Run**

2. Run the image upload script:
```bash
npx tsx supabase/upload-images.ts
```

This will:
- ✅ Create the `irca-center-images` storage bucket
- ✅ Upload all 29 center images (~2.9MB) to Supabase Storage
- ✅ Update the `ircacenter_details` table with image URLs

**📖 For detailed instructions, see:** [`IMAGE-MIGRATION-GUIDE.md`](./IMAGE-MIGRATION-GUIDE.md)

### Step 6: Verify Migration

1. Go to **Table Editor** in Supabase Dashboard
2. Check each table to ensure data has been populated correctly
3. Verify relationships between districts → talukas → villages
4. Confirm facility counts are accurate

## 📁 Files in this Directory

| File | Purpose |
|------|--------|
| `schema.sql` | Complete database schema with all 8 tables, RLS policies, triggers |
| `add-insert-policies.sql` | INSERT policies for data migration (run before migrate-data.ts) |
| `migrate-data.ts` | TypeScript script to migrate all data from local files to Supabase |
| `add-images-column.sql` | Schema update to add images column to ircacenter_details |
| `upload-images.ts` | TypeScript script to upload images to Supabase Storage |
| `IMAGE-MIGRATION-GUIDE.md` | Comprehensive guide for image migration process |
| `README.md` | This file - migration overview and instructions |

## 📊 Database Schema Overview

```
districts (31 records)
  ↓
talukas (linked to districts)
  ↓
villages (linked to talukas)
  ↓
village_facility_counts (facility statistics per village)

ircacenters (government + private centers)
hospitals (government + private hospitals)
psychiatrists
ircacenter_details (detailed info + image URLs)

Supabase Storage:
irca-center-images/ (bucket with 29 center images)
```

## 🔒 Security

- Row Level Security (RLS) is enabled on all tables
- Public read access is granted for all tables (data is public-facing)
- Write access requires authentication (not needed for this app)

## 🔧 Troubleshooting

### RLS Policy Error (42501)

**Error:** `new row violates row-level security policy for table "tablename"`

**Solution:**
1. Make sure you ran the `add-insert-policies.sql` script (Step 2)
2. Verify the INSERT policies exist in Supabase Dashboard:
   - Go to **Authentication** → **Policies**
   - Check each table has both SELECT and INSERT policies
3. If policies exist but still failing, try dropping and recreating them:
   ```sql
   -- In Supabase SQL Editor
   DROP POLICY IF EXISTS "Allow public insert on districts" ON districts;
   CREATE POLICY "Allow public insert on districts" ON districts FOR INSERT WITH CHECK (true);
   -- Repeat for other tables
   ```

### Migration Script Fails

1. Ensure Supabase credentials in `src/lib/supabaseClient.ts` are correct
2. Verify the schema has been executed successfully
3. Check for any error messages in the console output
4. Ensure all local data files exist and are importable

### Schema Execution Fails

1. Make sure UUID extension is enabled
2. Drop existing tables if re-running: `DROP TABLE IF EXISTS [table_name] CASCADE;`
3. Check for any syntax errors in the SQL

### Data Not Appearing

1. Verify RLS policies are created correctly
2. Check table permissions in Supabase Dashboard
3. Confirm migration script completed without errors
4. Use SQL Editor to manually query tables: `SELECT * FROM districts LIMIT 10;`

## 📝 Notes

- The migration script is idempotent but will create duplicate entries if run multiple times
- To re-run migration, first clear all tables or drop and recreate the database
- Keep your Supabase credentials secure and never commit them to public repositories
- Consider using environment variables for production deployments
