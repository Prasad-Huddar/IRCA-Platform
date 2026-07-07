# Supabase Authentication Setup Guide

## Current Status ✅
- **Backend API**: Not deployed yet (returns 404)
- **Supabase Auth**: Working and ready for testing
- **App**: Falls back to Supabase when backend is unavailable

## Quick Setup for Testing

### 1. Create Test Users in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add user"** or create users through the app

### 2. Test User Creation Options

#### Option A: Through the App (Recommended)
- Open the mobile app
- Go to **Register** screen
- Use a real email address (not gmail if blocked)
- Create password: `Password123!`
- The app will create the user in Supabase

#### Option B: Manual Creation in Dashboard
1. In Supabase Dashboard → Authentication → Users
2. Click **"Add new user"**
3. Enter:
   - **Email**: `test@example.com`
   - **Password**: `Password123!`
   - **Confirm password**: `Password123!`
4. Click **"Add user"**

### 3. Disable Email Confirmation (For Testing)

1. In Supabase Dashboard → Authentication → Settings
2. Find **"Enable email confirmations"**
3. **Toggle OFF** for testing
4. Click **"Save"**

### 4. Test Credentials

Once users are created, you can test with:

#### Test User 1:
- **Email**: `test@example.com`
- **Password**: `Password123!`

#### Test User 2:
- **Email**: `demo@irca.org`
- **Password**: `Demo123!`

#### Test User 3:
- **Email**: `admin@karnataka.gov.in`
- **Password**: `Admin123!`

### 5. Common Issues & Solutions

#### "Invalid login credentials"
- **Cause**: User doesn't exist in Supabase
- **Solution**: Create user first (register or manual)

#### "Email address is invalid"
- **Cause**: Email domain blocked by Supabase
- **Solution**: Use different email domain (example.com, irca.org, etc.)

#### "User already registered"
- **Cause**: Email already in use
- **Solution**: Use different email or login existing user

### 6. Environment Variables Check

Ensure your `.env` file has:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 7. Backend API Integration (Future)

When your backend API is ready:
1. Deploy to Render/Heroku/Vercel
2. Update `EXPO_PUBLIC_API_URL` in `.env`
3. App will automatically use backend API
4. Fallback to Supabase if backend fails

## Current App Features ✅

- **Government-style design** with official branding
- **Robust authentication** with Supabase
- **Session management** with AsyncStorage
- **Error handling** with detailed logging
- **Backend-ready** architecture
- **Mobile-optimized** UI components

## Testing Checklist ✅

- [ ] Create test user in Supabase
- [ ] Disable email confirmation (for testing)
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Verify session persistence
- [ ] Check error handling

The app is ready for testing with Supabase authentication!
