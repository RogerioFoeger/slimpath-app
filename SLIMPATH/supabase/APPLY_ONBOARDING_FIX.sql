-- ============================================================
-- COMPREHENSIVE ONBOARDING FIX SCRIPT
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- STEP 1: Diagnostic - Check current state
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '=== DIAGNOSTIC REPORT ===';
  RAISE NOTICE 'Checking database state...';
END $$;

-- Check if unique constraint already exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'user_onboarding' 
        AND constraint_name = 'user_onboarding_user_id_unique'
    ) 
    THEN '✅ Unique constraint already exists'
    ELSE '❌ Unique constraint MISSING - will be added'
  END as constraint_status;

-- Check for duplicate onboarding records
SELECT 
  CASE 
    WHEN COUNT(*) > 0 
    THEN '⚠️  WARNING: ' || COUNT(*) || ' users have duplicate onboarding records'
    ELSE '✅ No duplicate onboarding records found'
  END as duplicate_status
FROM (
  SELECT user_id, COUNT(*) as count
  FROM user_onboarding
  GROUP BY user_id
  HAVING COUNT(*) > 1
) duplicates;

-- STEP 2: Clean up any duplicate records
-- ============================================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove duplicates, keeping only the most recent one per user
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
    RAISE NOTICE '✅ No duplicates to remove';
  END IF;
END $$;

-- STEP 3: Add unique constraint (if it doesn't exist)
-- ============================================================
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_onboarding' 
      AND constraint_name = 'user_onboarding_user_id_unique'
  ) THEN
    -- Add the constraint
    ALTER TABLE user_onboarding
    ADD CONSTRAINT user_onboarding_user_id_unique UNIQUE (user_id);
    
    RAISE NOTICE '✅ Added unique constraint on user_id';
  ELSE
    RAISE NOTICE '✅ Unique constraint already exists, skipping';
  END IF;
END $$;

-- STEP 4: Verify the fix was applied
-- ============================================================
SELECT 
  '✅ FIX VERIFICATION' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_onboarding' 
  AND constraint_name = 'user_onboarding_user_id_unique';

-- STEP 5: Show current onboarding records
-- ============================================================
SELECT 
  '📊 CURRENT ONBOARDING RECORDS' as info,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN onboarding_completed THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN NOT onboarding_completed THEN 1 ELSE 0 END) as incomplete
FROM user_onboarding;

-- STEP 6: Show any users stuck in onboarding
-- ============================================================
SELECT 
  '🔍 USERS STUCK IN ONBOARDING' as info,
  u.email,
  u.profile_type,
  uo.onboarding_completed,
  uo.created_at,
  uo.updated_at
FROM users u
LEFT JOIN user_onboarding uo ON uo.user_id = u.id
WHERE uo.onboarding_completed = FALSE OR uo.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ ONBOARDING FIX COMPLETE!';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Review the output above';
  RAISE NOTICE '2. If you have users stuck in onboarding, they should now be able to complete it';
  RAISE NOTICE '3. Test with a new user signup or existing stuck user';
  RAISE NOTICE '4. Check your application logs for any remaining errors';
END $$;

