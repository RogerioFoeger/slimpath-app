'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles } from 'lucide-react'

interface Step7WelcomeProps {
  userName: string
  profileType: string
  onStart: () => void
}

export function Step7Welcome({ userName, profileType, onStart }: Step7WelcomeProps) {
  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <motion.div
        className="flex justify-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-secondary flex items-center justify-center shadow-large">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <span className="text-2xl">🎉</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Welcome Message */}
      <Card className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Everything is Ready, {userName}! 🎯
        </h1>

        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg">
          <p className="text-gray-700 mb-2">
            <strong>Your {profileType} Type Unlock Plan has been generated.</strong>
          </p>
          <p className="text-sm text-gray-600">
            Over the next 30 days, you'll receive daily missions, personalized 
            nutrition guidance, and targeted workouts designed specifically for your profile.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900">Daily Micro-Actions</p>
              <p className="text-sm text-gray-600">
                Simple tasks that build lasting habits
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <p className="font-semibold text-gray-900">Personalized Nutrition</p>
              <p className="text-sm text-gray-600">
                Meal plans tailored to your {profileType} profile
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-semibold text-gray-900">Gamified Progress</p>
              <p className="text-sm text-gray-600">
                Earn Slim Points and unlock exclusive content
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold text-gray-900">24/7 AI Support</p>
              <p className="text-sm text-gray-600">
                Lean is always here to guide and motivate you
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Your First Mission is Simple:
          </p>
          <p className="text-sm text-gray-700">
            Drink your first glass of water and check it off below. 
            Small steps lead to big transformations! 💧
          </p>
        </div>
      </Card>

      <Button onClick={onStart} className="w-full" size="lg">
        Start Day 01 →
      </Button>

      <p className="text-center text-sm text-gray-500">
        Remember: Consistency beats perfection. You've got this! 💪
      </p>
    </div>
  )
}

