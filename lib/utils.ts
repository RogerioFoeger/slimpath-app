import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(2))
}

export function calculateWaterIntake(weightKg: number): number {
  // 35ml per kg of body weight
  return Math.round(weightKg * 0.035 * 10) / 10 // in liters
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, isFemale: boolean = true): number {
  // Mifflin-St Jeor Equation
  if (isFemale) {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
  }
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calculate the current day number based on onboarding completion date
 * Day 1 is the day onboarding was completed
 * @param completedAt - ISO date string of when onboarding was completed
 * @returns Day number (1-30)
 */
export function calculateCurrentDay(completedAt: string | null | undefined): number {
  if (!completedAt) return 1
  
  const startDate = new Date(completedAt)
  const today = new Date()
  
  // Set both dates to midnight for accurate day calculation
  startDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  // Calculate days difference
  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Day 1 is the day onboarding was completed, so add 1
  const currentDay = diffDays + 1
  
  // Cap at 30 days
  return Math.min(Math.max(currentDay, 1), 30)
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  const diff = end.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getProgressPercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(b64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

