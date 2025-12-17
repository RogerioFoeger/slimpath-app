-- ========================================
-- RESET ALL USER DATA
-- ========================================
-- This script completely removes all user data from the database
-- while preserving content tables (daily_content, profile_content, etc.)
-- 
-- ⚠️  WARNING: THIS WILL DELETE ALL USER ACCOUNTS AND THEIR DATA
-- Use this for development/testing only!
-- 
-- What gets deleted:
-- - All user authentication accounts (auth.users)
-- - All user profiles (users table)
-- - All user onboarding data
-- - All user daily progress
-- - All mood check-ins
-- - All push notification subscriptions
-- - All user bonus unlocks
--
-- What gets preserved:
-- - Daily content (tasks, messages, etc.)
-- - Profile content (star foods, allowed foods)
-- - Bonus content
-- - Admin users (if any)
-- ========================================

BEGIN;

-- Step 1: Delete all user-specific data
-- (These will be automatically deleted due to ON DELETE CASCADE when we delete users,
--  but we're being explicit for clarity)

DELETE FROM user_bonus_unlocks;
DELETE FROM push_subscriptions;
DELETE FROM mood_checkins;
DELETE FROM user_daily_progress;
DELETE FROM user_onboarding;

-- Step 2: Delete all user profiles from the public.users table
DELETE FROM users;

-- Step 3: Delete all authentication users from Supabase auth
-- This is the most important step - removes all login credentials
DELETE FROM auth.users;

-- Optional: Reset any sequences if needed
-- (Not needed in this schema since we use UUIDs)

-- Verify deletion
DO $$
DECLARE
  user_count INTEGER;
  auth_count INTEGER;
  onboarding_count INTEGER;
  progress_count INTEGER;
  mood_count INTEGER;
  push_count INTEGER;
  bonus_unlock_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO onboarding_count FROM user_onboarding;
  SELECT COUNT(*) INTO progress_count FROM user_daily_progress;
  SELECT COUNT(*) INTO mood_count FROM mood_checkins;
  SELECT COUNT(*) INTO push_count FROM push_subscriptions;
  SELECT COUNT(*) INTO bonus_unlock_count FROM user_bonus_unlocks;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'USER DATA DELETION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users remaining: %', user_count;
  RAISE NOTICE 'Auth users remaining: %', auth_count;
  RAISE NOTICE 'Onboarding records remaining: %', onboarding_count;
  RAISE NOTICE 'Progress records remaining: %', progress_count;
  RAISE NOTICE 'Mood check-ins remaining: %', mood_count;
  RAISE NOTICE 'Push subscriptions remaining: %', push_count;
  RAISE NOTICE 'Bonus unlocks remaining: %', bonus_unlock_count;
  RAISE NOTICE '========================================';
  
  IF user_count = 0 AND auth_count = 0 THEN
    RAISE NOTICE '✅ All user data successfully deleted!';
    RAISE NOTICE 'Users can now register fresh accounts.';
  ELSE
    RAISE WARNING '⚠️  Some user data may remain. Please check manually.';
  END IF;
END $$;

COMMIT;

-- ========================================
-- INSTRUCTIONS:
-- ========================================
-- 1. Run this script in your Supabase SQL Editor
-- 2. The script will delete all user accounts and related data
-- 3. Check the console output to verify deletion
-- 4. Users can now register again from scratch
-- 
-- Note: If you want to keep certain test users, modify this script
-- to use WHERE clauses to exclude specific emails or IDs
-- ========================================

