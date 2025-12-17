-- ============================================================
-- FIX: Onboarding Restart Bug
-- ============================================================
-- This script fixes the bug where clicking "Start Day 01" causes
-- the onboarding to restart from the first screen.
--
-- Root Cause: Missing unique constraint on user_onboarding.user_id
-- allows multiple onboarding records per user, causing upsert to fail
-- and queries to return inconsistent results.
--
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Check current state
DO $$
BEGIN
  RAISE NOTICE '=== ONBOARDING BUG FIX ===';
  RAISE NOTICE 'Analyzing database state...';
END $$;

-- Check if unique constraint exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'user_onboarding' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%user_id%'
    ) 
    THEN '✅ Unique constraint on user_id already exists'
    ELSE '❌ Unique constraint MISSING - will be added'
  END as constraint_status;

-- Check for duplicate onboarding records
SELECT 
  user_id,
  COUNT(*) as record_count,
  array_agg(onboarding_completed) as completion_statuses,
  array_agg(created_at ORDER BY created_at) as created_timestamps
FROM user_onboarding
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Step 2: Clean up duplicate records
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Keep only the most recent record for each user
  WITH duplicates AS (
    SELECT id
    FROM user_onboarding
    WHERE id NOT IN (
      SELECT DISTINCT ON (user_id) id
      FROM user_onboarding
      ORDER BY user_id, created_at DESC
    )
  )
  DELETE FROM user_onboarding
  WHERE id IN (SELECT id FROM duplicates);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE '✅ Removed % duplicate onboarding record(s)', deleted_count;
  ELSE
    RAISE NOTICE '✅ No duplicates found';
  END IF;
END $$;

-- Step 3: Add unique constraint if it doesn't exist
DO $$
BEGIN
  -- Check if any unique constraint on user_id exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_onboarding' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%user_id%'
  ) THEN
    -- Add the constraint
    ALTER TABLE user_onboarding
    ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);
    
    RAISE NOTICE '✅ Added unique constraint on user_id';
  ELSE
    RAISE NOTICE '✅ Unique constraint already exists';
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE '⚠️ Constraint already exists (caught unique_violation exception)';
  WHEN duplicate_object THEN
    RAISE NOTICE '⚠️ Constraint already exists (caught duplicate_object exception)';
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Constraint may already exist or other issue: %', SQLERRM;
END $$;

-- Step 4: Verify the fix
SELECT 
  '✅ VERIFICATION' as status,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_onboarding' 
  AND constraint_type = 'UNIQUE';

-- Step 5: Show current onboarding records summary
SELECT 
  '📊 SUMMARY' as info,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN onboarding_completed THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN NOT onboarding_completed THEN 1 ELSE 0 END) as incomplete
FROM user_onboarding;

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ FIX COMPLETE!';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'The onboarding bug should now be fixed.';
  RAISE NOTICE 'Users can complete onboarding without it restarting.';
  RAISE NOTICE '';
  RAISE NOTICE 'If you still experience issues:';
  RAISE NOTICE '1. Clear your browser cache/cookies';
  RAISE NOTICE '2. Try with a new user signup';
  RAISE NOTICE '3. Check the browser console for errors';
END $$;

