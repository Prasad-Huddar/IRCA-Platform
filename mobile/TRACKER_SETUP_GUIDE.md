# 📱 Mobile Tracker Setup & Debugging Guide

## ✅ Current Status

Your mobile `TrackerScreen.tsx` is **100% database-driven** with NO hardcoded or dummy data. All values are fetched from Supabase using RPC calls.

## 🔍 Why You're Seeing Zeros

The screen shows `0` values and "Not set" because:

1. **No tracker has been created yet** in the database for your user
2. The app correctly shows empty state when no data exists
3. This is the EXPECTED behavior for a new user

## 📊 Data Flow Architecture

```
User Login
    ↓
fetchUserData() called
    ↓
Parallel API Calls:
  ├─ getAllSobrietyTrackers(user.id)  → RPC: get_all_trackers
  ├─ getUserGoals(user.id)            → Direct: user_goals table
  ├─ getUserMilestones(user.id)       → Direct: sobriety_milestones table
  └─ getDailyTrackingLogs(user.id)    → Direct: daily_tracking_log table
    ↓
State Updates (trackers, goals, milestones, logs)
    ↓
UI Renders with Real Data
```

## 🎯 How to Test with Real Data

### Step 1: Create Your First Tracker

1. Open the mobile app
2. Navigate to **Tracker Screen**
3. Click **"Start Tracker"** or **"Add New Tracker"**
4. Fill in:
   - **Addiction Type**: `alcohol` (or `smoking`, `drugs`, etc.)
   - **Daily Cost**: `500` (INR you save per day)
5. Click **"Start Tracking"**

### Step 2: Verify Database Entry

Check your Supabase dashboard:
- Table: `sobriety_tracker`
- Should see new row with:
  - `user_id`: Your logged-in user ID
  - `addiction_type`: What you entered
  - `is_active`: `true`
  - `current_streak_days`: `0` (just started)
  - `daily_cost`: What you entered

### Step 3: Watch Real-Time Updates

After creating a tracker, you should see:
- ✅ **Timer starts counting** (live updates every second)
- ✅ **Current Streak**: Shows days since start
- ✅ **Daily Cost**: Shows your entered value
- ✅ **Status Badge**: Changes to "Active" (green)

## 🐛 Debug Console Logs

I've added comprehensive logging. Check your console for:

```
🔄 Fetching tracker data for user: <user-id>
📊 Trackers Response: { success: true, dataLength: 1, data: [...] }
🎯 Goals Response: { success: true, dataLength: 0 }
🏆 Milestones Response: { success: true, dataLength: 0 }
✅ All trackers: 1
✅ Current (non-stopped) trackers: 1
✅ Active tracker found: alcohol
✅ Data fetch complete
```

### If You See Errors:

```
❌ Failed to fetch trackers: <error message>
```
This means:
- RPC function `get_all_trackers` might not exist
- User doesn't have permission (RLS policy issue)
- Database connection problem

## 🔧 Troubleshooting

### Issue: "No data displaying"

**Solution:**
1. Check console logs for API responses
2. Verify user is logged in: `console.log(user.id)`
3. Check Supabase dashboard for actual data
4. Ensure RPC functions exist:
   - `get_all_trackers`
   - `initialize_sobriety_tracker`
   - `get_user_profile_secure`

### Issue: "Database Error" alert

**Solution:**
1. Check Supabase RLS policies
2. Verify RPC functions are created
3. Check network connectivity
4. Review Supabase logs for errors

### Issue: Timer not updating

**Solution:**
- Ensure `activeTracker.is_active === true`
- Check `activeTracker.start_date` is valid ISO string
- Verify `useEffect` dependencies are correct

## 📝 Data Validation Checklist

Before reporting issues, verify:

- [ ] User is authenticated (`user.id` exists)
- [ ] Tracker created in database
- [ ] `is_active` is `true` for active trackers
- [ ] `start_date` is valid ISO timestamp
- [ ] `daily_cost` is a number
- [ ] Console shows successful API responses
- [ ] No RLS policy blocking reads

## 🎨 UI States

### 1. **No Tracker Created** (Current State)
```
Current Streak: 0 days
Longest Streak: 0 days
Total Days Sober: 0
Relapses: 0
Status: Not Set
```

### 2. **Active Tracker**
```
Current Streak: 5 days
Longest Streak: 5 days
Total Days Sober: 5
Relapses: 0
Status: Active (Green Badge)
Timer: "5d 12h 34m 56s"
```

### 3. **Paused Tracker**
```
Status: Paused (Gray Badge)
Timer: Stopped
```

## 🔐 Required Supabase RPC Functions

Ensure these exist in your Supabase project:

1. **`get_all_trackers(user_id_input UUID)`**
   - Returns: All trackers for user
   - Security: SECURITY DEFINER

2. **`initialize_sobriety_tracker(...)`**
   - Creates new tracker
   - Returns: tracker_id

3. **`update_sobriety_tracker_status(...)`**
   - Toggles active/paused
   - Returns: Updated tracker

4. **`stop_sobriety_tracker(...)`**
   - Ends tracker permanently
   - Sets `end_date`

5. **`create_daily_log(...)`**
   - Records daily activity
   - Returns: log_id

## 📊 Expected Data After First Tracker

Once you create a tracker, `fetchUserData()` will return:

```json
{
  "trackers": [
    {
      "id": "uuid-here",
      "user_id": "your-user-id",
      "addiction_type": "alcohol",
      "start_date": "2026-01-08T01:30:00Z",
      "is_active": true,
      "current_streak_days": 0,
      "longest_streak_days": 0,
      "total_sobriety_days": 0,
      "relapses_count": 0,
      "daily_cost": 500
    }
  ],
  "goals": [],
  "milestones": [],
  "logs": []
}
```

## 🚀 Next Steps

1. **Create a tracker** using the UI
2. **Check console logs** to verify API calls
3. **Verify database** has the entry
4. **Watch the timer** start counting
5. **Test relapse recording** (optional)
6. **Add goals** to track progress

## 📞 Support

If data still doesn't show after creating a tracker:

1. Share console logs
2. Share Supabase error logs
3. Verify RPC functions exist
4. Check RLS policies

---

**Remember:** The app is working correctly! It just needs data to display. Create your first tracker to see it come alive! 🎉
