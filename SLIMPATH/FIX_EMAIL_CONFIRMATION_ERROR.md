# Fix: "Failed to load onboarding" Error After Email Confirmation

## Problem

When users click the email confirmation link after signing up, they see:
- Error message: "Failed to load onboarding"
- Infinite loading screen
- Cannot proceed to onboarding

## Root Causes

1. **Missing User Profile Creation**: When users sign up, Supabase Auth creates an entry in `auth.users` but doesn't automatically create a corresponding entry in the `public.users` table. When the onboarding page tries to fetch the user profile, it fails.

2. **Loading State Not Reset**: When the error occurs, the onboarding page displays an error toast but doesn't stop the loading spinner.

## Solution

### Step 1: Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the contents of: supabase/migration_fix_user_creation.sql
```

Or use the Supabase CLI:

```bash
cd SLIMPATH
npx supabase db push
```

This migration will:
- ✅ Create a trigger that automatically creates user profiles when someone signs up
- ✅ Add the necessary RLS policy for user creation
- ✅ Backfill profiles for any existing auth users without profiles

### Step 2: Verify in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Functions**
3. Verify `handle_new_user()` function exists
4. Navigate to **Database** → **Triggers**
5. Verify `on_auth_user_created` trigger exists on `auth.users` table

### Step 3: Test the Fix

1. Sign up with a new test email
2. Check your email and click the confirmation link
3. You should now be redirected to the onboarding page successfully
4. The onboarding flow should work smoothly

### Step 4: Fix Existing Users (If Needed)

If you have existing users who confirmed their email but don't have profiles:

1. They can try logging in again from the login page
2. Or you can manually create their profiles by running:

```sql
INSERT INTO public.users (id, email, profile_type, full_name)
SELECT 
  au.id,
  au.email,
  'hormonal' as profile_type,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

## What Was Fixed in the Code

### 1. `app/onboarding/page.tsx`
- Added `setLoading(false)` in the error catch block
- This ensures the loading spinner stops even when errors occur

### 2. `supabase/schema.sql`
- Added `handle_new_user()` trigger function
- Added `on_auth_user_created` trigger
- Added RLS policy for user insertion

## Prevention

This fix ensures that:
- ✅ Every new signup automatically creates a user profile
- ✅ The onboarding page handles errors gracefully
- ✅ Users won't see infinite loading screens
- ✅ Existing users without profiles get backfilled

## Troubleshooting

### Still seeing the error?

1. **Check if migration ran successfully**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

2. **Check if trigger exists**:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

3. **Check user profile exists**:
   ```sql
   SELECT * FROM auth.users au
   LEFT JOIN public.users pu ON au.id = pu.id
   WHERE au.email = 'your-test-email@example.com';
   ```

4. **Check browser console** for detailed error messages

### Need to reset a test user?

```sql
-- Delete from auth (will cascade to public.users)
DELETE FROM auth.users WHERE email = 'test@example.com';
```

## Questions?

If you're still experiencing issues:
1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify your Supabase environment variables are correct in `.env.local`


