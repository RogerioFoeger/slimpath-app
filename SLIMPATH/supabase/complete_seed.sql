-- Complete Seed Data for SlimPath AI
-- This includes all necessary data for Days 1-30

-- Sample Daily Content (Days 1-3)
INSERT INTO daily_content (day_number, lean_message, micro_challenge, panic_button_text, panic_button_audio_url) VALUES
(1, 
 'Welcome to Day 1! Today is about building momentum. Small steps lead to big transformations. I''m here with you every step of the way!',
 'Drink one full glass of water right now and check it off your list.',
 'Take a deep breath. You''re doing great. Remember why you started this journey. You have the power to overcome any craving or challenge.',
 null),

(2,
 'Day 2 - You showed up! That''s already a win. Today we''re focusing on consistency. One day at a time, one choice at a time.',
 'Take a 5-minute walk, even if it''s just around your house or office.',
 'Pause for a moment. Close your eyes. Take 5 slow, deep breaths. You are stronger than any temporary feeling.',
 null),

(3,
 'Day 3 - You''re building your streak! Your body is already starting to adapt to these new habits. Keep the momentum going!',
 'Prepare your meals for tomorrow. Planning is half the battle won.',
 'It''s okay to feel challenged. Every craving passes. Focus on how proud you''ll feel when you overcome this moment.',
 null)
ON CONFLICT (day_number) DO NOTHING;

-- Sample Tasks for Day 1
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
ON CONFLICT DO NOTHING;

-- Sample Tasks for Day 2
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
ON CONFLICT DO NOTHING;

-- Sample Tasks for Day 3
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
ON CONFLICT DO NOTHING;

-- Profile Content for ALL 6 profile types for Day 1
INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'hormonal', 'Eggs', 
'Rich in protein and healthy fats to support hormone balance',
'["Eggs", "Avocado", "Wild Salmon", "Leafy Greens", "Berries", "Nuts", "Seeds", "Greek Yogurt"]'::jsonb
FROM daily_content WHERE day_number = 1
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'inflammatory', 'Turmeric',
'Powerful anti-inflammatory properties to reduce inflammation',
'["Turmeric", "Ginger", "Fatty Fish", "Berries", "Leafy Greens", "Olive Oil", "Green Tea", "Walnuts"]'::jsonb
FROM daily_content WHERE day_number = 1
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'cortisol', 'Dark Chocolate',
'Rich in magnesium to help manage stress and cortisol levels',
'["Dark Chocolate", "Bananas", "Oatmeal", "Almonds", "Spinach", "Sweet Potato", "Chamomile Tea", "Blueberries"]'::jsonb
FROM daily_content WHERE day_number = 1
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'metabolic', 'Green Tea',
'Boosts metabolism and enhances fat burning naturally',
'["Green Tea", "Lean Protein", "Chili Peppers", "Coffee", "Whole Grains", "Legumes", "Apple Cider Vinegar", "Coconut Oil"]'::jsonb
FROM daily_content WHERE day_number = 1
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'retention', 'Cucumber',
'Natural diuretic to help reduce water retention',
'["Cucumber", "Celery", "Asparagus", "Watermelon", "Lemon Water", "Parsley", "Dandelion Tea", "Potassium-Rich Foods"]'::jsonb
FROM daily_content WHERE day_number = 1
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'insulinic', 'Cinnamon',
'Helps regulate blood sugar and improve insulin sensitivity',
'["Cinnamon", "Leafy Greens", "Chia Seeds", "Fatty Fish", "Nuts", "Apple Cider Vinegar", "Berries", "Avocado"]'::jsonb
FROM daily_content WHERE day_number = 1
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

-- Profile Content for ALL 6 profile types for Day 2
INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'hormonal', 'Wild Salmon', 
'Omega-3 fatty acids support hormone production and balance',
'["Wild Salmon", "Flax Seeds", "Walnuts", "Kale", "Broccoli", "Organic Chicken", "Quinoa", "Pumpkin Seeds"]'::jsonb
FROM daily_content WHERE day_number = 2
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'inflammatory', 'Ginger',
'Natural anti-inflammatory compound that aids digestion',
'["Ginger", "Turmeric", "Blueberries", "Spinach", "Chia Seeds", "Extra Virgin Olive Oil", "Beets", "Garlic"]'::jsonb
FROM daily_content WHERE day_number = 2
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'cortisol', 'Bananas',
'Rich in potassium and B vitamins to combat stress',
'["Bananas", "Avocado", "Swiss Chard", "Pumpkin Seeds", "Turkey", "Oranges", "Yogurt", "Brown Rice"]'::jsonb
FROM daily_content WHERE day_number = 2
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'metabolic', 'Chili Peppers',
'Capsaicin boosts metabolism and increases calorie burn',
'["Chili Peppers", "Lean Beef", "Lentils", "Green Tea", "Broccoli", "Almonds", "Greek Yogurt", "Eggs"]'::jsonb
FROM daily_content WHERE day_number = 2
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'retention', 'Asparagus',
'Natural diuretic rich in antioxidants',
'["Asparagus", "Cucumber", "Watermelon", "Tomatoes", "Bell Peppers", "Lemon", "Ginger Tea", "Cabbage"]'::jsonb
FROM daily_content WHERE day_number = 2
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'insulinic', 'Chia Seeds',
'High in fiber to slow sugar absorption and stabilize blood sugar',
'["Chia Seeds", "Spinach", "Salmon", "Almonds", "Quinoa", "Green Beans", "Strawberries", "Cauliflower"]'::jsonb
FROM daily_content WHERE day_number = 2
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

-- Profile Content for ALL 6 profile types for Day 3
INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'hormonal', 'Avocado', 
'Healthy fats support hormone synthesis and balance',
'["Avocado", "Hemp Seeds", "Mackerel", "Brussels Sprouts", "Raspberries", "Lamb", "Buckwheat", "Brazil Nuts"]'::jsonb
FROM daily_content WHERE day_number = 3
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'inflammatory', 'Blueberries',
'Packed with antioxidants to fight inflammation',
'["Blueberries", "Strawberries", "Kale", "Walnuts", "Sweet Potato", "Wild Rice", "Black Beans", "Turmeric"]'::jsonb
FROM daily_content WHERE day_number = 3
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'cortisol', 'Oatmeal',
'Complex carbs that stabilize mood and reduce cortisol spikes',
'["Oatmeal", "Cashews", "Salmon", "Dark Leafy Greens", "Coconut", "Herbal Tea", "Pistachios", "Mango"]'::jsonb
FROM daily_content WHERE day_number = 3
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'metabolic', 'Lean Protein',
'Increases thermogenesis and preserves muscle mass',
'["Chicken Breast", "Turkey", "White Fish", "Tofu", "Cottage Cheese", "Protein Powder", "Edamame", "Tempeh"]'::jsonb
FROM daily_content WHERE day_number = 3
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'retention', 'Celery',
'Natural diuretic that helps flush excess fluids',
'["Celery", "Fennel", "Cranberries", "Artichoke", "Garlic", "Onions", "Beets", "Pineapple"]'::jsonb
FROM daily_content WHERE day_number = 3
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'insulinic', 'Leafy Greens',
'Low glycemic index foods that keep insulin stable',
'["Spinach", "Kale", "Arugula", "Swiss Chard", "Romaine", "Collard Greens", "Bok Choy", "Watercress"]'::jsonb
FROM daily_content WHERE day_number = 3
ON CONFLICT (daily_content_id, profile_type) DO NOTHING;

