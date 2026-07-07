# 📸 Image Migration Guide - Supabase Storage

This guide explains how to migrate IRCA center images from local files to Supabase Storage.

## 📋 Overview

**What this migration does:**
1. Creates a Supabase Storage bucket named `irca-center-images`
2. Uploads all 29 center images (2.9MB total) to Supabase Storage
3. Updates the `ircacenter_details` table with public image URLs
4. Enables the detail pages to load images from Supabase instead of local files

## 🎯 Prerequisites

✅ You must have already completed:
- [x] Database schema creation (`schema.sql`)
- [x] Data migration (`migrate-data.ts`)
- [x] All center details are in the `ircacenter_details` table

## 🚀 Migration Steps

### Step 1: Update Database Schema

Run the SQL migration to add the `images` column:

```bash
# Copy the SQL content from add-images-column.sql
# Then run it in Supabase SQL Editor
```

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste content from `supabase/add-images-column.sql`
3. Click **Run**

This will:
- Add `images TEXT[]` column to `ircacenter_details`
- Create an index for faster queries
- Add UPDATE policy for migration

### Step 2: Run Image Upload Script

Execute the upload script to move images to Supabase Storage:

```bash
npx tsx supabase/upload-images.ts
```

**What happens:**
- Creates the `irca-center-images` bucket (public, 5MB limit)
- Uploads all 29 images organized by center ID
- Updates database records with public URLs
- Shows progress for each center

**Expected output:**
```
🚀 Starting Image Upload and Migration Process
============================================================
🪣 Creating storage bucket...
✅ Bucket created successfully

📤 Uploading images to Supabase Storage...

📸 Processing irca_dharwad_maitri...
  ✓ Uploaded: dh-maitri1.png
  ✓ Uploaded: dh-maitri2.jpg
  ✓ Uploaded: dh-maitri3.png
  ✓ Uploaded: dh-maitri4.jpg
  ✓ Uploaded: dh-maitri5.jpg
✅ irca_dharwad_maitri: 5 images uploaded

... (repeats for all centers)

💾 Updating database with image URLs...

✅ Updated irca_dharwad_maitri with 5 image URLs
✅ Updated irca_tumkur_achrd with 4 image URLs
... (repeats for all centers)

============================================================
🎉 Image upload and migration completed successfully!

Summary:
  - Total centers: 11
  - Total images uploaded: 29

Next steps:
  1. Run the updated frontend to see images from Supabase Storage
  2. Verify images are displaying correctly on detail pages
  3. (Optional) Remove local images from src/images/irca-center/
```

### Step 3: Verify in Supabase Dashboard

1. Go to **Storage** in Supabase Dashboard
2. You should see the `irca-center-images` bucket
3. Browse folders for each center ID (e.g., `irca_dharwad_maitri/`)
4. Check that all images are uploaded

### Step 4: Test the Frontend

```bash
npm run dev
```

**Test checklist:**
- [ ] Visit any IRCA center detail page
- [ ] Check that images load from Supabase URLs
- [ ] Verify image carousel works correctly
- [ ] Test image modal (click to enlarge)
- [ ] Check image grid thumbnails
- [ ] Verify all centers have their correct images

## 📁 File Structure After Migration

### Supabase Storage Structure:
```
irca-center-images/
├── irca_dharwad_maitri/
│   ├── dh-maitri1.png
│   ├── dh-maitri2.jpg
│   ├── dh-maitri3.png
│   ├── dh-maitri4.jpg
│   └── dh-maitri5.jpg
├── irca_tumkur_achrd/
│   ├── tum-achrd1.jpg
│   ├── tum-achrd2.jpg
│   ├── tum-achrd3.jpg
│   └── tum-achrd4.jpg
├── irca_bellary_maitri/
│   ├── bellari-maitri1.jpg
│   ├── bellari-maitri2.jpg
│   ├── bellari-maitri3.jpg
│   └── bellari-maitri4.jpg
├── irca_davangere_bhuvaneshwari/
│   ├── davan-bhuv1.jpg
│   ├── davan-bhuv2.jpg
│   └── davan-bhuv3.jpg
├── irca_davangere_shakti/
│   ├── davan-shakti1.jpg
│   ├── davan-shakti2.jpg
│   ├── davan-shakti3.jpg
│   └── davan-shakti4.jpg
├── irca_koppal_date/
│   ├── kop-date1.jpg
│   ├── kop-date2.jpg
│   ├── kop-date3.jpg
│   └── kop-date4.jpg
├── irca_mandya_dhwani/
│   └── mandya-dhwani1.jpg
├── irca_mandya_river_valley/
│   └── mandya-dhwani1.jpg
├── irca_mandya_akshaya/
│   └── mandya-dhwani1.jpg
├── irca_chitradurga_date/
│   └── chitr-date1.jpg
└── irca_koppal_surabee/
    ├── kop-sura1.jpg
    ├── kop-sura2.jpg
    └── kop-sura3.jpg
```

### Database Schema:
```sql
ircacenter_details table:
- center_id (FK to ircacenters)
- title
- beds
- established_year
- rating
- location
- phone[]
- email
- overview
- services[]
- staff (JSONB)
- contact (JSONB)
- images[] ← NEW! Array of Supabase Storage URLs
```

## 🔍 Image URL Format

After migration, image URLs will look like:
```
https://eaeaujqoxiflrspoabci.supabase.co/storage/v1/object/public/irca-center-images/irca_dharwad_maitri/dh-maitri1.png
```

These URLs are:
- **Public** - No authentication required
- **Permanent** - URLs don't expire
- **Fast** - Served via CDN
- **Optimized** - Automatic image optimization

## 🎨 Frontend Changes

### Before (Hardcoded):
```typescript
const getCenterImages = (centerId: string) => {
  switch (centerId) {
    case 'irca_dharwad_maitri':
      return [
        '/src/images/irca-center/dh-maitri1.png',
        '/src/images/irca-center/dh-maitri2.jpg',
        // ... more hardcoded paths
      ];
    // ... more cases
  }
};
```

### After (Dynamic from Database):
```typescript
// Images fetched from Supabase
const centerImages = center?.images || [];
```

**Benefits:**
- ✅ No code changes needed to add/update images
- ✅ Images managed through database
- ✅ Easy to add more images via SQL UPDATE
- ✅ Centralized image management

## 🔧 Troubleshooting

### Issue: Bucket creation fails
**Solution:** Create manually in Supabase Dashboard:
1. Go to **Storage** → **New Bucket**
2. Name: `irca-center-images`
3. Enable: **Public bucket**
4. File size limit: `5242880` (5MB)
5. Allowed MIME types: `image/jpeg, image/png`

### Issue: Images don't upload
**Check:**
- Local images exist in `src/images/irca-center/`
- Supabase credentials are correct
- Network connection is stable
- Storage bucket exists and is public

### Issue: Images don't appear on frontend
**Check:**
1. Run query in Supabase SQL Editor:
```sql
SELECT center_id, images FROM ircacenter_details WHERE images IS NOT NULL;
```
2. Verify URLs are stored correctly
3. Open image URLs in browser to test accessibility
4. Check browser console for errors

### Issue: Some centers missing images
**Solution:** Run the upload script again (it uses `upsert: true` to overwrite)

## 📊 Image Statistics

| Center ID | Image Count | Total Size |
|-----------|-------------|------------|
| irca_dharwad_maitri | 5 | ~908 KB |
| irca_tumkur_achrd | 4 | ~1.3 MB |
| irca_bellary_maitri | 4 | ~498 KB |
| irca_davangere_bhuvaneshwari | 3 | ~392 KB |
| irca_davangere_shakti | 4 | ~266 KB |
| irca_koppal_date | 4 | ~401 KB |
| irca_koppal_surabee | 3 | ~251 KB |
| irca_mandya_dhwani | 1 | ~105 KB |
| irca_mandya_river_valley | 1 | ~105 KB |
| irca_mandya_akshaya | 1 | ~105 KB |
| irca_chitradurga_date | 1 | ~197 KB |
| **TOTAL** | **29** | **~2.9 MB** |

## 🎯 Success Criteria

Migration is successful when:
- ✅ All 29 images uploaded to Supabase Storage
- ✅ All 11 center records updated with image URLs
- ✅ Detail pages display images from Supabase
- ✅ Image carousel and modal work correctly
- ✅ No 404 errors in browser console

## 🗑️ Optional: Cleanup

After verifying everything works, you can:

1. **Remove local images** (keep as backup initially):
```bash
# Don't delete immediately - keep for 1-2 weeks as backup
# rm -rf src/images/irca-center/
```

2. **Remove unused code**:
- The old `getCenterImages()` function is already removed
- No other cleanup needed

## 📝 Notes

- **Storage costs:** Supabase free tier includes 1GB storage
- **Bandwidth:** Free tier includes 2GB/month egress
- **Image optimization:** Consider using Supabase Image Transformation in future
- **Backup:** Original images remain in `src/images/irca-center/` until you delete them

## 🎉 You're Done!

Images are now served from Supabase Storage with:
- Better performance (CDN delivery)
- Easier management (no code changes for updates)
- Scalability (can add unlimited images)
- Better UX (faster loading times)
