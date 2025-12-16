-- Migration: Fix automatic user profile creation
-- This migration adds a trigger to automatically create a user profile 
-- in the users table when someone signs up via Supabase Auth

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, profile_type, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    'hormonal', -- Default profile type, will be updated during onboarding
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (to allow re-running this migration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add policy to allow service role to insert users
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- For existing auth users without profiles, create their profiles
INSERT INTO public.users (id, email, profile_type, full_name)
SELECT 
  au.id,
  au.email,
  'hormonal' as profile_type,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;


