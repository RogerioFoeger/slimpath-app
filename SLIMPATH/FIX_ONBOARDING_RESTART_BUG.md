# Fix: Onboarding Restart Bug

## Problem Description
When a user signs up with a different email address and clicks "Start Day 01" after completing onboarding, the application incorrectly restarts the onboarding process from the first screen instead of proceeding to the dashboard.

## Root Causes Identified

1. **Missing Unique Constraint**: The `user_onboarding` table was missing a unique constraint on `user_id`, which:
   - Allowed multiple onboarding records for the same user
   - Caused `upsert` operations to fail or behave unpredictably
   - Led to queries returning inconsistent or duplicate results

2. **Caching/Timing Issues**: When navigating from onboarding to dashboard:
   - The dashboard would query the onboarding status immediately
   - Due to caching or database replication lag, it might not see the completed status
   - This caused an incorrect redirect back to onboarding

3. **Redirect Loop**: The interaction between onboarding and dashboard pages created a potential redirect loop when the onboarding status wasn't properly synchronized.

## Changes Made

### 1. Database Fix (`supabase/fix_onboarding_bug.sql`)
Created a SQL migration script that:
- ✅ Checks for and removes duplicate onboarding records
- ✅ Adds a unique constraint on `user_onboarding.user_id`
- ✅ Provides diagnostic information about the fix

**Action Required**: Run this SQL script in your Supabase SQL Editor:
```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste the contents of: supabase/fix_onboarding_bug.sql
# Click "Run" to execute
```

### 2. Onboarding Page (`app/onboarding/page.tsx`)

**Changes**:
- ✅ Updated `handleStartDashboard()` to set a sessionStorage flag when completing onboarding
- ✅ Changed `.single()` to `.maybeSingle()` to handle missing records gracefully
- ✅ Removed artificial delay and unnecessary `router.refresh()` call
- ✅ Updated upsert to explicitly specify `ignoreDuplicates: false`

**Key Improvement**:
```typescript
// Set flag to prevent redirect loop
sessionStorage.setItem('onboarding_just_completed', 'true')
router.push('/dashboard')
```

### 3. Dashboard Page (`app/dashboard/page.tsx`)

**Changes**:
- ✅ Added check for `onboarding_just_completed` sessionStorage flag
- ✅ Implements retry logic when onboarding status isn't immediately synced
- ✅ Provides better error handling and user feedback
- ✅ Prevents incorrect redirects during the completion flow

**Key Improvement**:
```typescript
// Check for completion flag and retry if needed
if (justCompleted === 'true') {
  sessionStorage.removeItem('onboarding_just_completed')
  // Retry logic with 1-second delay if status not synced
  if (!onboarding?.onboarding_completed) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Retry query once
  }
}
```

## How to Apply the Fix

### Step 1: Database Migration
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Open the file `supabase/fix_onboarding_bug.sql`
4. Copy its contents and paste into the SQL Editor
5. Click "Run" to execute
6. Verify the output shows: ✅ FIX COMPLETE!

### Step 2: Deploy Code Changes
The following files have been updated automatically:
- ✅ `app/onboarding/page.tsx`
- ✅ `app/dashboard/page.tsx`

If you're running locally:
```bash
# No action needed - changes are already in your files
# Just restart your dev server if it's running
npm run dev
```

If deployed to Vercel:
```bash
# Commit and push the changes
git add .
git commit -m "Fix: Onboarding restart bug on 'Start Day 01'"
git push origin main
```

### Step 3: Testing
1. Clear browser cache and cookies (or use incognito mode)
2. Sign up with a new email address
3. Complete the entire onboarding flow
4. Click "Start Day 01"
5. Verify you land on the dashboard (not back at onboarding step 1)
6. Refresh the dashboard page to ensure you stay on dashboard

## Technical Details

### Why This Fix Works

1. **Unique Constraint**: Ensures each user has exactly one onboarding record, making upsert operations reliable and queries deterministic.

2. **SessionStorage Flag**: Provides a client-side signal that onboarding just completed, allowing the dashboard to handle the transition gracefully even if the database hasn't fully synced.

3. **Retry Logic**: Gives the database a brief moment to commit and replicate the onboarding completion before making a final decision on redirection.

4. **Graceful Fallback**: Uses `.maybeSingle()` instead of `.single()` to avoid errors when records don't exist yet.

### Expected Behavior After Fix

✅ User completes onboarding → clicks "Start Day 01" → lands on dashboard
✅ Refreshing dashboard keeps user on dashboard
✅ No redirect loops or infinite redirects
✅ Proper error messages if something goes wrong
✅ Clean onboarding state management

## Troubleshooting

If you still experience issues after applying the fix:

1. **Clear Browser Cache**: The sessionStorage flag requires a clean browser state
   ```
   Chrome: Ctrl+Shift+Delete → Clear browsing data
   ```

2. **Verify Database Fix**: Run this query in Supabase SQL Editor:
   ```sql
   SELECT constraint_name, constraint_type 
   FROM information_schema.table_constraints 
   WHERE table_name = 'user_onboarding' AND constraint_type = 'UNIQUE';
   ```
   You should see a constraint on `user_id`.

3. **Check for Duplicates**: Run this query:
   ```sql
   SELECT user_id, COUNT(*) as count
   FROM user_onboarding
   GROUP BY user_id
   HAVING COUNT(*) > 1;
   ```
   This should return no rows (no duplicates).

4. **Browser Console**: Check for errors in the browser console (F12) during the transition from onboarding to dashboard.

## Additional Notes

- This fix is backward compatible with existing users
- Existing completed onboarding records are preserved
- The fix handles both new signups and existing users stuck in onboarding
- SessionStorage is used (not localStorage) so it clears when the browser tab closes

## Files Changed

1. ✅ `supabase/fix_onboarding_bug.sql` (NEW)
2. ✅ `app/onboarding/page.tsx` (MODIFIED)
3. ✅ `app/dashboard/page.tsx` (MODIFIED)
4. ✅ `FIX_ONBOARDING_RESTART_BUG.md` (NEW - this file)

---

**Status**: ✅ Ready to Deploy

If you encounter any issues or have questions, please check the browser console for error messages and refer to the troubleshooting section above.

