-- Quick Database State Check
-- Run this in Supabase Dashboard > SQL Editor to see what data exists

-- 1. Check Users
SELECT 
  id, 
  email, 
  current_day, 
  profile_type,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check Daily Content
SELECT 
  day_number,
  LEFT(lean_message, 50) as message_preview
FROM daily_content
ORDER BY day_number;

-- 3. Check Profile Content (count by day)
SELECT 
  dc.day_number,
  COUNT(pc.id) as profile_count,
  STRING_AGG(pc.profile_type::text, ', ') as profiles
FROM daily_content dc
LEFT JOIN profile_content pc ON pc.daily_content_id = dc.id
GROUP BY dc.day_number
ORDER BY dc.day_number;

-- 4. Check for specific user (replace email)
-- Change 'your-email@example.com' to your actual email
WITH user_info AS (
  SELECT 
    u.id,
    u.email,
    u.current_day,
    u.profile_type,
    uo.onboarding_completed
  FROM users u
  LEFT JOIN user_onboarding uo ON uo.user_id = u.id
  WHERE u.email = 'harryronifell@outlook.com'  -- CHANGE THIS
)
SELECT 
  ui.*,
  (SELECT COUNT(*) FROM daily_content WHERE day_number = ui.current_day) as has_daily_content,
  (SELECT COUNT(*) FROM profile_content pc 
   JOIN daily_content dc ON dc.id = pc.daily_content_id 
   WHERE dc.day_number = ui.current_day 
   AND pc.profile_type = ui.profile_type) as has_profile_content
FROM user_info ui;

-- 5. Summary
SELECT 
  'Users' as table_name,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Daily Content' as table_name,
  COUNT(*) as count
FROM daily_content
UNION ALL
SELECT 
  'Profile Content' as table_name,
  COUNT(*) as count
FROM profile_content
UNION ALL
SELECT 
  'Daily Tasks' as table_name,
  COUNT(*) as count
FROM daily_tasks;

