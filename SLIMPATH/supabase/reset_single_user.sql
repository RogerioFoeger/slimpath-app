-- ========================================
-- RESET SINGLE USER DATA
-- ========================================
-- This script removes a specific user's data from the database
-- Useful for testing when you don't want to delete all users
-- 
-- ⚠️  Replace 'user@example.com' with the actual email
-- ========================================

BEGIN;

-- Set the email of the user you want to delete
DO $$
DECLARE
  target_email TEXT := 'user@example.com';  -- 🔧 CHANGE THIS EMAIL
  target_user_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE '❌ User with email % not found', target_email;
  ELSE
    RAISE NOTICE 'Found user: % (ID: %)', target_email, target_user_id;
    
    -- Delete user-specific data (these will cascade automatically, but being explicit)
    DELETE FROM user_bonus_unlocks WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % bonus unlocks', deleted_count;
    
    DELETE FROM push_subscriptions WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % push subscriptions', deleted_count;
    
    DELETE FROM mood_checkins WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % mood check-ins', deleted_count;
    
    DELETE FROM user_daily_progress WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % daily progress records', deleted_count;
    
    DELETE FROM user_onboarding WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % onboarding records', deleted_count;
    
    -- Delete from users table
    DELETE FROM users WHERE id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profile', deleted_count;
    
    -- Delete from auth.users (this is the main authentication record)
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth record', deleted_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ User % successfully deleted!', target_email;
    RAISE NOTICE 'This user can now register again.';
    RAISE NOTICE '========================================';
  END IF;
END $$;

COMMIT;

-- ========================================
-- INSTRUCTIONS:
-- ========================================
-- 1. Edit line 13 to set target_email to the user you want to delete
-- 2. Run this script in your Supabase SQL Editor
-- 3. Check the console output to verify deletion
-- 4. That specific user can now register again
-- ========================================

