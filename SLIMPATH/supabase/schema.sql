-- SlimPath AI Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profile Types Enum
CREATE TYPE user_profile_type AS ENUM (
  'hormonal',
  'inflammatory',
  'cortisol',
  'metabolic',
  'retention',
  'insulinic'
);

-- User Status Enum
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'cancelled'
);

-- Subscription Plan Enum
CREATE TYPE subscription_plan AS ENUM (
  'monthly',
  'annual'
);

-- Mood Type Enum
CREATE TYPE mood_type AS ENUM (
  'happy',
  'neutral',
  'tired',
  'irritated'
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  profile_type user_profile_type NOT NULL,
  status user_status DEFAULT 'active',
  subscription_plan subscription_plan,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  current_day INTEGER DEFAULT 1,
  slim_points INTEGER DEFAULT 0,
  bonus_unlocked BOOLEAN DEFAULT FALSE,
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Onboarding Data Table
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  height_cm DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  bmi DECIMAL(4,2),
  medications JSONB DEFAULT '[]',
  physical_limitations JSONB DEFAULT '[]',
  dietary_restrictions JSONB DEFAULT '[]',
  diet_history VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Content Table (Admin manages this)
CREATE TABLE daily_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_number INTEGER NOT NULL UNIQUE,
  lean_message TEXT NOT NULL,
  micro_challenge TEXT NOT NULL,
  panic_button_audio_url TEXT,
  panic_button_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Tasks Table
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_content_id UUID REFERENCES daily_content(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  task_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile-Specific Content Table
CREATE TABLE profile_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_content_id UUID REFERENCES daily_content(id) ON DELETE CASCADE,
  profile_type user_profile_type NOT NULL,
  star_food_name VARCHAR(255) NOT NULL,
  star_food_description TEXT,
  allowed_foods JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(daily_content_id, profile_type)
);

-- User Daily Progress Table
CREATE TABLE user_daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  tasks_completed JSONB DEFAULT '[]',
  tasks_total INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  point_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_number, date)
);

-- Mood Check-ins Table
CREATE TABLE mood_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood mood_type NOT NULL,
  time_of_day VARCHAR(20) NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE
);

-- Push Notification Subscriptions Table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bonus Content Table
CREATE TABLE bonus_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL,
  content_url TEXT,
  unlock_points INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Bonus Unlocks Table
CREATE TABLE user_bonus_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bonus_content_id UUID REFERENCES bonus_content(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bonus_content_id)
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profile_type ON users(profile_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX idx_daily_content_day_number ON daily_content(day_number);
CREATE INDEX idx_daily_tasks_content_id ON daily_tasks(daily_content_id);
CREATE INDEX idx_profile_content_type ON profile_content(profile_type);
CREATE INDEX idx_user_daily_progress_user_id ON user_daily_progress(user_id);
CREATE INDEX idx_user_daily_progress_date ON user_daily_progress(date);
CREATE INDEX idx_mood_checkins_user_id ON mood_checkins(user_id);
CREATE INDEX idx_mood_checkins_date ON mood_checkins(date);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Updated At Trigger to Tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_content_updated_at BEFORE UPDATE ON daily_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_daily_progress_updated_at BEFORE UPDATE ON user_daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bonus_content_updated_at BEFORE UPDATE ON bonus_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own onboarding" ON user_onboarding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" ON user_onboarding
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON user_daily_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mood checkins" ON mood_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mood checkins" ON mood_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for content tables
CREATE POLICY "Anyone can view daily content" ON daily_content
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view daily tasks" ON daily_tasks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view profile content" ON profile_content
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view bonus content" ON bonus_content
  FOR SELECT USING (is_active = true);

-- Seed some initial data
INSERT INTO bonus_content (title, description, content_type, unlock_points, is_active) VALUES
('Advanced Nutrition Guide', 'Unlock advanced nutrition strategies tailored to your profile', 'pdf', 40, true),
('Exclusive Workout Videos', 'Access premium workout routines designed for your type', 'video', 40, true),
('Personal Coach Session', 'Schedule a 1-on-1 session with a SlimPath coach', 'session', 40, true);

