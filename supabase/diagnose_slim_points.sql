-- Diagnose Slim Points Issue
-- This script checks why users have 2 slim points instead of 1

-- Check the specific users and their point history
SELECT 
  '📊 USER OVERVIEW' as info,
  u.email,
  u.current_day,
  u.slim_points,
  u.created_at as user_created,
  u.updated_at as user_updated
FROM users u
WHERE u.email IN ('ronifell@outlook.com', 'harryronifell@outlook.com')
ORDER BY u.email;

-- Check their daily progress records
SELECT 
  '📅 DAILY PROGRESS RECORDS' as info,
  u.email,
  udp.day_number,
  udp.date,
  udp.completion_percentage,
  udp.point_earned,
  udp.created_at,
  udp.updated_at
FROM user_daily_progress udp
JOIN users u ON u.id = udp.user_id
WHERE u.email IN ('ronifell@outlook.com', 'harryronifell@outlook.com')
ORDER BY u.email, udp.day_number, udp.date;

-- Count total progress records per user
SELECT 
  '📈 PROGRESS RECORD COUNT' as info,
  u.email,
  COUNT(*) as total_records,
  SUM(CASE WHEN udp.point_earned THEN 1 ELSE 0 END) as points_earned_count
FROM user_daily_progress udp
JOIN users u ON u.id = udp.user_id
WHERE u.email IN ('ronifell@outlook.com', 'harryronifell@outlook.com')
GROUP BY u.email;

-- Check if there are duplicate records for the same day
SELECT 
  '⚠️  DUPLICATE DAY RECORDS' as warning,
  u.email,
  udp.day_number,
  udp.date,
  COUNT(*) as duplicate_count
FROM user_daily_progress udp
JOIN users u ON u.id = udp.user_id
WHERE u.email IN ('ronifell@outlook.com', 'harryronifell@outlook.com')
GROUP BY u.email, udp.day_number, udp.date
HAVING COUNT(*) > 1;

-- Check all users to see if this is a widespread issue
SELECT 
  '🌍 ALL USERS SLIM POINTS' as info,
  u.email,
  u.current_day,
  u.slim_points,
  CASE 
    WHEN u.slim_points = u.current_day - 1 THEN '✅ Correct'
    WHEN u.slim_points > u.current_day - 1 THEN '⚠️ TOO MANY points'
    ELSE '⚠️ TOO FEW points'
  END as status
FROM users u
ORDER BY u.created_at DESC
LIMIT 10;

-- Summary: Expected vs Actual
WITH user_stats AS (
  SELECT 
    u.email,
    u.current_day,
    u.slim_points as actual_points,
    (u.current_day - 1) as expected_points_if_all_complete,
    COALESCE(SUM(CASE WHEN udp.point_earned THEN 1 ELSE 0 END), 0) as points_from_progress
  FROM users u
  LEFT JOIN user_daily_progress udp ON udp.user_id = u.id
  WHERE u.email IN ('ronifell@outlook.com', 'harryronifell@outlook.com')
  GROUP BY u.id, u.email, u.current_day, u.slim_points
)
SELECT 
  '🔍 ANALYSIS' as summary,
  email,
  current_day,
  expected_points_if_all_complete,
  points_from_progress,
  actual_points,
  CASE 
    WHEN actual_points = expected_points_if_all_complete THEN '✅ Points match expected'
    WHEN actual_points = points_from_progress THEN '✅ Points match progress records'
    ELSE '⚠️ MISMATCH - Points dont match records'
  END as diagnosis
FROM user_stats;

