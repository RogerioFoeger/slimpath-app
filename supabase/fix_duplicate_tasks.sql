-- Fix Duplicate Tasks Issue
-- This script removes duplicate tasks and adds a constraint to prevent future duplicates

-- Step 1: Delete ALL existing tasks (we'll re-add them cleanly)
DELETE FROM daily_tasks;

-- Step 2: Add a unique constraint to prevent duplicate tasks
-- This ensures the same task_order can't exist twice for the same daily_content_id
ALTER TABLE daily_tasks 
ADD CONSTRAINT daily_tasks_unique_order 
UNIQUE (daily_content_id, task_order);

-- Step 3: Re-insert tasks cleanly for Day 1
INSERT INTO daily_tasks (daily_content_id, task_text, task_order)
SELECT id, task, task_order FROM daily_content, 
(VALUES 
  ('Drink 8 glasses of water today', 1),
  ('Take progress photos (optional)', 2),
  ('Read today''s nutrition guide', 3),
  ('Complete 10-minute morning stretch', 4),
  ('Log your mood check-in', 5),
  ('Prepare a healthy breakfast', 6),
  ('Take a 15-minute walk', 7)
) AS tasks(task, task_order)
WHERE day_number = 1
ON CONFLICT (daily_content_id, task_order) DO NOTHING;

-- Step 4: Re-insert tasks for Day 2
INSERT INTO daily_tasks (daily_content_id, task_text, task_order)
SELECT id, task, task_order FROM daily_content,
(VALUES
  ('Morning hydration - 2 glasses before breakfast', 1),
  ('Eat today''s star food', 2),
  ('5-minute meditation or breathing exercise', 3),
  ('Prepare a healthy lunch', 4),
  ('Afternoon walk - 20 minutes', 5),
  ('Track your water intake', 6),
  ('Evening wind-down routine', 7)
) AS tasks(task, task_order)
WHERE day_number = 2
ON CONFLICT (daily_content_id, task_order) DO NOTHING;

-- Step 5: Re-insert tasks for Day 3
INSERT INTO daily_tasks (daily_content_id, task_text, task_order)
SELECT id, task, task_order FROM daily_content,
(VALUES
  ('Morning routine: Water + Stretch', 1),
  ('Meal prep for tomorrow', 2),
  ('Try one new healthy recipe', 3),
  ('25-minute cardio or active movement', 4),
  ('Midday mood check-in', 5),
  ('Healthy dinner with star food', 6),
  ('Reflect on today''s wins', 7)
) AS tasks(task, task_order)
WHERE day_number = 3
ON CONFLICT (daily_content_id, task_order) DO NOTHING;

-- Done! Now you should have exactly 7 tasks per day (21 total for days 1-3)

