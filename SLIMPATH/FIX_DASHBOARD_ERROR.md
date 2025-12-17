# Fix "Error loading dashboard" Issue

## Problem
The dashboard is showing "Error loading dashboard" because the database is missing required content data.

## Quick Diagnosis

1. **Start your dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the diagnostic page** in your browser:
   ```
   http://localhost:3000/api/diagnose
   ```

   This will show you exactly what data is missing from your database.

## Most Likely Causes

### 1. Missing Profile Content for Days 2-3
The original `seed.sql` only included profile content for **Day 1**. If your user is on Day 2 or 3, the dashboard will fail.

### 2. Database Not Seeded
If you haven't run any seed scripts, your database will have no daily content at all.

## Solutions

### Solution 1: Run Complete Seed via Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Create New Query**:
   - Click "+ New query"
   - Name it "Complete Seed"

3. **Copy and Paste**:
   - Open the file: `supabase/complete_seed.sql`
   - Copy ALL contents
   - Paste into the SQL Editor

4. **Run the Query**:
   - Click "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for completion (should take 1-2 seconds)

5. **Refresh Dashboard**:
   - Go back to your app: http://localhost:3000/dashboard
   - Refresh the page
   - Dashboard should now load! 🎉

### Solution 2: Reset User to Day 1 (Quick Workaround)

If you just want to test quickly:

1. **Go to Supabase Dashboard > Table Editor**
2. **Open the `users` table**
3. **Find your user**
4. **Edit the user**:
   - Change `current_day` to `1`
   - Make sure `profile_type` is one of: `hormonal`, `inflammatory`, `cortisol`, `metabolic`, `retention`, or `insulinic`
5. **Save changes**
6. **Refresh dashboard** - it should work now (but only for Day 1)

### Solution 3: Use Supabase CLI (If you have it installed)

```bash
# Navigate to project
cd SLIMPATH

# Run seed file
npx supabase db execute -f supabase/complete_seed.sql

# Or if you have Supabase CLI installed:
supabase db execute -f supabase/complete_seed.sql
```

## Verification Steps

After running the seed:

1. **Check the diagnostic page**: http://localhost:3000/api/diagnose
2. **Look for these confirmations**:
   - ✓ Found X daily_content entries
   - ✓ Found Y profile_content entries
   - ✓ Daily content found for day [your day]
   - ✓ Profile content found for [your profile type]

3. **Refresh your dashboard**: http://localhost:3000/dashboard

## What the Complete Seed Includes

- **Daily Content**: Days 1, 2, and 3
- **Profile Content**: All 6 profile types for each day:
  - `hormonal`
  - `inflammatory`
  - `cortisol`
  - `metabolic`
  - `retention`
  - `insulinic`
- **Daily Tasks**: 7 tasks for each day
- **Uses ON CONFLICT DO NOTHING**: Safe to run multiple times

## Still Having Issues?

1. **Check browser console** (F12) for specific errors
2. **Check Supabase Dashboard > Logs** for database errors
3. **Verify environment variables**:
   - `.env.local` should have:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Technical Details

The dashboard requires these data points to load:
1. **User profile** from `users` table
2. **Daily content** for the user's `current_day`
3. **Profile content** matching both:
   - The daily_content_id for that day
   - The user's profile_type
4. **Tasks** for that day's content
5. **User progress** (auto-created if missing)

If ANY of these are missing, you'll see "Error loading dashboard".

The `complete_seed.sql` file ensures all necessary data exists for Days 1-3.

