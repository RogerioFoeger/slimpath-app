-- Fix for "Failed to create user" webhook error
-- This removes the conflicting trigger that was causing duplicate user creation

-- Step 1: Remove the auto-create user trigger
-- (The webhook route handles user creation manually, so we don't need this trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Clean up any existing test users (optional)
-- Uncomment the line below if you want to delete test users
-- DELETE FROM auth.users WHERE email LIKE 'test%@example.com';

-- Step 3: Verify tables exist
SELECT 'Users table exists' as status, COUNT(*) as count FROM users;
SELECT 'Onboarding table exists' as status, COUNT(*) as count FROM user_onboarding;

-- Done! Now test your webhook again.

