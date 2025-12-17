import { ProfileTypeInfo, UserProfileType } from './types'

export const PROFILE_TYPES: Record<UserProfileType, ProfileTypeInfo> = {
  hormonal: {
    key: 'hormonal',
    name: 'Hormonal Type',
    description: 'Your weight is primarily influenced by hormonal imbalances',
    icon: '🌸',
    color: '#FF6B9D',
  },
  inflammatory: {
    key: 'inflammatory',
    name: 'Inflammatory Type',
    description: 'Chronic inflammation is affecting your metabolism',
    icon: '🔥',
    color: '#FF5722',
  },
  cortisol: {
    key: 'cortisol',
    name: 'Cortisol Type (Stress)',
    description: 'Stress and cortisol levels are your main challenge',
    icon: '⚡',
    color: '#FFC107',
  },
  metabolic: {
    key: 'metabolic',
    name: 'Metabolic Type',
    description: 'Your metabolism needs a strategic boost',
    icon: '⚙️',
    color: '#2196F3',
  },
  retention: {
    key: 'retention',
    name: 'Retention Type',
    description: 'Water retention is masking your progress',
    icon: '💧',
    color: '#00BCD4',
  },
  insulinic: {
    key: 'insulinic',
    name: 'Insulinic Type',
    description: 'Insulin resistance is blocking fat loss',
    icon: '🍯',
    color: '#9C27B0',
  },
}

export const MEDICATIONS = [
  'None',
  'Birth Control',
  'Thyroid Medication',
  'Antidepressants / Anxiolytics',
  'Blood Pressure / Heart Medication',
  'Other',
]

export const PHYSICAL_LIMITATIONS = [
  'No limitations - cleared for exercise',
  'Knee pain (avoid jumping)',
  'Back pain (avoid classic crunches)',
  'Reduced mobility',
]

export const DIETARY_RESTRICTIONS = [
  'Gluten Allergy (Celiac)',
  'Lactose Intolerance',
  'No Red Meat',
  'No Seafood',
  'Vegetarian/Vegan',
  'No restrictions',
]

export const DIET_HISTORY_OPTIONS = [
  { value: 'beginner', label: "Beginner: I've never tried anything serious" },
  { value: 'yoyo', label: 'Yoyo Effect: I lose weight but gain it back quickly' },
  { value: 'stuck', label: "Stuck: I've tried everything and weight doesn't change" },
]

export const MOODS = [
  { value: 'happy', emoji: '😀', label: 'Happy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'tired', emoji: '😫', label: 'Tired' },
  { value: 'irritated', emoji: '😡', label: 'Irritated' },
]

export const TIMES_OF_DAY = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌙' },
]

export const POINTS_FOR_COMPLETION = 1
export const BONUS_UNLOCK_THRESHOLD = 40

export const SUBSCRIPTION_PRICES = {
  monthly: 37,
  annual: 297,
}

export const PUSH_NOTIFICATION_TIME = '08:00' // 8:00 AM daily notification

