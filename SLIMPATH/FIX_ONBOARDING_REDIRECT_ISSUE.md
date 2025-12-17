# Fix: Onboarding Redirect Issue

## Problem
Clicking "Start Day 01" button redirects back to "Calibrate My Plan" instead of the dashboard.

## Root Cause
The `user_onboarding` table was missing a UNIQUE constraint on `user_id`, causing the upsert operation to fail or behave unexpectedly. This meant the onboarding completion status wasn't being saved properly.

## Solution

### Step 1: Apply Database Migration

You need to run a SQL migration in your Supabase dashboard to add the unique constraint:

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `fix_onboarding_unique_constraint.sql`
5. Click **Run** to execute the migration

The migration will:
- Remove any duplicate onboarding records
- Add a UNIQUE constraint on `user_id`
- Ensure upsert operations work correctly

### Step 2: Code Updates (Already Applied)

The following code changes have been made:

1. **Enhanced error handling** in `app/onboarding/page.tsx`:
   - Proper error checking when saving onboarding data
   - Verification step to confirm data was saved
   - Better handling of database errors

2. **Fixed upsert operation** to specify conflict resolution:
   ```typescript
   await supabase.from('user_onboarding').upsert({
     // ... data
   }, {
     onConflict: 'user_id'  // This tells Supabase which column to use for conflict resolution
   })
   ```

3. **Improved navigation** to dashboard:
   - Double-checks onboarding status before navigating
   - Adds delay to ensure database sync
   - Uses router.refresh() for clean navigation

4. **Better dashboard check** in `app/dashboard/page.tsx`:
   - Uses `.maybeSingle()` instead of `.single()` for better error handling
   - Improved logging for debugging

### Step 3: Test the Fix

1. **If you have a test user that's stuck in the loop:**
   - Delete their onboarding record in Supabase:
     ```sql
     DELETE FROM user_onboarding WHERE user_id = 'YOUR_USER_ID';
     ```
   - Try the onboarding flow again

2. **Fresh test:**
   - Create a new test account
   - Complete the onboarding flow
   - Click "Start Day 01"
   - Should now successfully navigate to dashboard

## Verification

After applying the migration, verify it worked:

```sql
-- Check that the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'user_onboarding' 
  AND constraint_name = 'user_onboarding_user_id_unique';

-- Should return one row showing the UNIQUE constraint
```

## Additional Debugging

If you still experience issues, you can check the browser console for error messages:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when clicking "Start Day 01"
4. Check for messages like "Error saving onboarding:" or "Onboarding verification failed:"

You can also check the Supabase logs:
1. Go to Supabase Dashboard
2. Click on **Logs** → **API Logs**
3. Look for failed queries around the time you tried to complete onboarding

## Files Changed

1. ✅ `supabase/fix_onboarding_unique_constraint.sql` (NEW - apply this in Supabase)
2. ✅ `app/onboarding/page.tsx` (updated upsert and error handling)
3. ✅ `app/dashboard/page.tsx` (improved onboarding check)

## Need Help?

If the issue persists after applying the migration:
1. Check the browser console for errors
2. Check Supabase logs for failed queries
3. Verify the migration was applied successfully
4. Try with a fresh user account

