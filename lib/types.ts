// User Profile Types
export type UserProfileType = 
  | 'hormonal'
  | 'inflammatory'
  | 'cortisol'
  | 'metabolic'
  | 'retention'
  | 'insulinic'

export type UserStatus = 'active' | 'inactive' | 'cancelled'
export type SubscriptionPlan = 'monthly' | 'annual'
export type MoodType = 'happy' | 'neutral' | 'tired' | 'irritated'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

// Database Types
export interface User {
  id: string
  email: string
  full_name?: string
  profile_type: UserProfileType
  status: UserStatus
  subscription_plan?: SubscriptionPlan
  subscription_end_date?: string
  current_day: number
  slim_points: number
  bonus_unlocked: boolean
  webhook_data?: any
  created_at: string
  updated_at: string
}

export interface UserOnboarding {
  id: string
  user_id: string
  age?: number
  height_cm?: number
  current_weight_kg?: number
  target_weight_kg?: number
  bmi?: number
  medications: string[]
  physical_limitations: string[]
  dietary_restrictions: string[]
  diet_history?: string
  onboarding_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface DailyContent {
  id: string
  day_number: number
  lean_message: string
  micro_challenge: string
  panic_button_audio_url?: string
  panic_button_text?: string
  created_at: string
  updated_at: string
}

export interface DailyTask {
  id: string
  daily_content_id: string
  task_text: string
  task_order: number
  created_at: string
}

export interface ProfileContent {
  id: string
  daily_content_id: string
  profile_type: UserProfileType
  star_food_name: string
  star_food_description?: string
  allowed_foods: string[]
  created_at: string
}

export interface UserDailyProgress {
  id: string
  user_id: string
  day_number: number
  date: string
  tasks_completed: string[]
  tasks_total: number
  completion_percentage: number
  point_earned: boolean
  created_at: string
  updated_at: string
}

export interface MoodCheckin {
  id: string
  user_id: string
  mood: MoodType
  time_of_day: TimeOfDay
  notes?: string
  created_at: string
  date: string
}

export interface BonusContent {
  id: string
  title: string
  description?: string
  content_type: string
  content_url?: string
  unlock_points: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Onboarding Form Types
export interface OnboardingStep1Data {
  profile_type: UserProfileType
}

export interface OnboardingStep2Data {
  age: number
  height_cm: number
  current_weight_kg: number
  target_weight_kg: number
}

export interface OnboardingStep3Data {
  medications: string[]
  physical_limitations: string[]
}

export interface OnboardingStep4Data {
  dietary_restrictions: string[]
}

export interface OnboardingStep5Data {
  diet_history: string
}

// Profile Type Metadata
export interface ProfileTypeInfo {
  key: UserProfileType
  name: string
  description: string
  icon: string
  color: string
}

// Webhook Payload
export interface WebhookPayload {
  email: string
  name?: string
  profile_type: UserProfileType
  subscription_plan: SubscriptionPlan
  transaction_id?: string
  amount?: number
}

