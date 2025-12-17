-- Fix Stuck Users in Onboarding
-- This script resets the onboarding records for stuck users
-- so they can complete the onboarding process fresh

-- Option 1: Delete their onboarding records (RECOMMENDED)
-- This allows them to go through onboarding again from scratch
DELETE FROM user_onboarding 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN ('ronifell@outlook.com', 'harryronifell@outlook.com')
);

-- Verify the deletion
SELECT 
  '✅ CLEANUP COMPLETE' as status,
  u.email,
  CASE 
    WHEN uo.id IS NULL THEN '✅ Ready for fresh onboarding'
    ELSE '⚠️ Still has onboarding record'
  END as onboarding_status
FROM users u
LEFT JOIN user_onboarding uo ON uo.user_id = u.id
WHERE u.email IN ('ronifell@outlook.com', 'harryronifell@outlook.com');

-- Instructions:
-- After running this script:
-- 1. Have both users logout and login again
-- 2. They will be redirected to onboarding
-- 3. Complete the onboarding flow
-- 4. Click "Start Day 01" - should now work!

