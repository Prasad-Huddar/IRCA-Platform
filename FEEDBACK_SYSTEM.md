# Feedback System Implementation

This document describes the feedback system implementation for the IRCA Platform.

## Overview

The feedback system allows users to submit various types of feedback through a form, which gets stored in a Supabase database. Administrators can view and manage these submissions through an admin interface.

## Database Schema

### Feedback Table

The `feedback` table stores all user feedback submissions with the following structure:

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT NOT NULL UNIQUE,           -- Unique reference ID (e.g., IRCA-20250107-1234)
  name TEXT NOT NULL,                          -- User name (or "Anonymous")
  email TEXT NOT NULL,                         -- User email (or placeholder for anonymous)
  phone TEXT NOT NULL,                         -- User phone (or placeholder for anonymous)
  feedback_type TEXT NOT NULL,                 -- Type: feedback, complaint, testimonial, suggestion, appreciation
  subject TEXT NOT NULL,                       -- Feedback subject/title
  message TEXT NOT NULL,                       -- Detailed feedback message
  testimonial_consent BOOLEAN DEFAULT false,  -- Consent to use as testimonial
  anonymous BOOLEAN DEFAULT false,            -- Whether submission is anonymous
  status TEXT DEFAULT 'pending',               -- Status: pending, reviewed, resolved, closed
  admin_notes TEXT,                           -- Notes added by administrators
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Files Created/Modified

### 1. Database Migration
- **File**: `supabase/create-feedback-table.sql`
- **Purpose**: Creates the feedback table, indexes, RLS policies, and helper functions

### 2. Backend Service
- **File**: `src/services/feedbackService.ts`
- **Purpose**: Handles all feedback-related operations with Supabase

### 3. Frontend Pages
- **File**: `src/pages/FeedbackPage.tsx` (Modified)
- **Purpose**: User-facing feedback submission form with backend integration

- **File**: `src/pages/AdminFeedbackPage.tsx` (New)
- **Purpose**: Admin interface for viewing and managing feedback submissions

## Key Features

### User Feedback Form
- Multiple feedback types (General Feedback, Complaint, Success Story, Suggestion, Appreciation)
- Form validation with Zod schema
- Anonymous submission option
- Testimonial consent checkbox
- Automatic reference ID generation
- Success confirmation with reference ID

### Admin Management Interface
- Dashboard with statistics (total, pending, reviewed, resolved, closed)
- Search and filter functionality
- Detailed feedback view
- Status management (pending → reviewed → resolved → closed)
- Admin notes functionality
- CSV export capability
- Responsive design

### Backend Functions
- `submitFeedback()`: Submit new feedback with automatic reference ID generation
- `submitFeedbackDirect()`: Fallback method using direct insert
- `getAllFeedback()`: Retrieve all feedback for admin view
- `getFeedbackByReferenceId()`: Get specific feedback by reference ID
- `updateFeedbackStatus()`: Update feedback status and admin notes
- `getFeedbackStats()`: Get feedback statistics for dashboard

## Security Features

### Row Level Security (RLS)
- Public insert permissions for feedback submissions
- Authenticated user permissions for reading/updating feedback
- Proper data validation and sanitization

### Data Privacy
- Anonymous submission option that replaces personal data
- Testimonial consent tracking
- Admin-only access to sensitive information

## Setup Instructions

### 1. Database Setup
Run the migration script in your Supabase SQL editor:

```sql
-- Run the contents of supabase/create-feedback-table.sql
```

### 2. Environment Variables
Ensure your Supabase client is properly configured in `src/lib/supabaseClient.ts`.

### 3. Routing
Add the admin feedback page to your router configuration:

```tsx
import AdminFeedbackPage from './pages/AdminFeedbackPage';

// Add to your routes
<Route path="/admin/feedback" element={<AdminFeedbackPage />} />
```

## Usage

### For Users
1. Navigate to the Feedback page
2. Fill out the form with required information
3. Choose feedback type and optionally submit anonymously
4. Receive a reference ID for tracking

### For Administrators
1. Navigate to `/admin/feedback`
2. View feedback statistics and submissions
3. Use search and filters to find specific feedback
4. Click on any feedback item to view details
5. Update status and add admin notes as needed
6. Export data to CSV for reporting

## API Endpoints

The system uses Supabase RPC functions and direct table operations:

### RPC Function: `submit_feedback`
```sql
submit_feedback(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_feedback_type TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_testimonial_consent BOOLEAN DEFAULT false,
  p_anonymous BOOLEAN DEFAULT false
)
```

### Direct Table Operations
- `INSERT` on `feedback` table (public)
- `SELECT` on `feedback` table (authenticated)
- `UPDATE` on `feedback` table (authenticated)

## Error Handling

The system includes comprehensive error handling:
- Form validation errors displayed to users
- Backend submission errors with fallback options
- Admin interface error states
- Console logging for debugging

## Future Enhancements

Potential improvements to consider:
1. Email notifications for new feedback
2. Feedback categorization and tagging
3. Automated response templates
4. Analytics and reporting dashboard
5. Feedback rating system
6. Integration with ticketing systems
7. Multi-language support
8. File attachment support

## Troubleshooting

### Common Issues
1. **Reference ID generation failures**: Check the `generate_feedback_reference_id()` function
2. **RLS permission errors**: Verify policies are correctly applied
3. **Form submission failures**: Check network connectivity and Supabase configuration
4. **Admin access issues**: Ensure user is authenticated with proper permissions

### Debugging
- Check browser console for JavaScript errors
- Verify Supabase connection in network tab
- Review Supabase logs for database errors
- Test RPC functions directly in Supabase SQL editor
