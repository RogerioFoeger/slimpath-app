# Verify Database Tables

## Required Tables for SlimPath AI:

1. ✅ **users** - Main user profiles
2. ✅ **user_onboarding** - Onboarding progress
3. ✅ **daily_content** - Daily challenges and content
4. ✅ **user_progress** - User daily progress
5. ✅ **user_mood_checkins** - Mood tracking
6. ✅ **nutrition_plans** - Meal plans by profile type
7. ✅ **admin_users** - Admin panel users
8. ✅ **push_subscriptions** - Push notification tokens

## How to Check if Tables Exist:

1. Go to: https://supabase.com/dashboard/project/bdzzylxxmqhylmogjedm/editor
2. Look at the left sidebar - you should see all 8 tables listed above
3. If you DON'T see these tables, you need to run the schema

## How to Run the Schema (If Missing):

1. Go to: https://supabase.com/dashboard/project/bdzzylxxmqhylmogjedm/sql/new
2. Open the file: `supabase/schema.sql` in your project
3. Copy ALL the contents (271 lines)
4. Paste into the SQL Editor in Supabase
5. Click "Run" (or press Ctrl+Enter)
6. Wait 30-60 seconds for it to complete
7. Check for any errors in the output

## After Running Schema:

1. Refresh the Table Editor to see the new tables
2. Go back to http://localhost:3000
3. Try signing up again
4. Should work now! ✅

## Common Issues:

**Issue**: "relation already exists"
- **Solution**: Tables are already there, no action needed

**Issue**: "permission denied"
- **Solution**: Make sure you're logged into the correct Supabase account

**Issue**: Still getting "Failed to fetch"
- **Solution**: Check browser console (F12) for detailed error message


