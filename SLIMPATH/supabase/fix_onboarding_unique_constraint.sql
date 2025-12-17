-- Fix User Onboarding Unique Constraint
-- This migration adds a unique constraint on user_id to ensure each user has only one onboarding record
-- and allows upsert operations to work correctly

-- Step 1: Remove any duplicate onboarding records (keep the most recent one)
DELETE FROM user_onboarding
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_onboarding
  ORDER BY user_id, created_at DESC
);

-- Step 2: Add unique constraint on user_id
ALTER TABLE user_onboarding
ADD CONSTRAINT user_onboarding_user_id_unique UNIQUE (user_id);

-- Step 3: Verify the constraint was added
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'user_onboarding';

