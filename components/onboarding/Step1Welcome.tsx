'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { UserProfileType } from '@/lib/types'
import { PROFILE_TYPES } from '@/lib/constants'

interface Step1WelcomeProps {
  profileType: UserProfileType
  userName?: string
  onNext: () => void
}

export function Step1Welcome({ profileType, userName, onNext }: Step1WelcomeProps) {
  const profile = PROFILE_TYPES[profileType]

  return (
    <div className="space-y-6">
      {/* Lean Avatar with Animation */}
      <motion.div
        className="flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <div className="w-32 h-32 relative">
          <img 
            src="/logo.png" 
            alt="Lean AI Coach" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </motion.div>

      {/* Welcome Message */}
      <Card className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Hello{userName ? `, ${userName}` : ''}! 👋
          </h1>
          
          <p className="text-gray-700 mb-4">
            I'm Lean, your AI health companion. I'm excited to have you here!
          </p>

          <div className="bg-primary-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              I've retrieved the analysis from our Scanner and confirmed your profile is:
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl">{profile.icon}</span>
              <div>
                <p className="font-bold text-lg" style={{ color: profile.color }}>
                  {profile.name}
                </p>
                <p className="text-sm text-gray-600">{profile.description}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-700">
            Now, I need to calibrate the technical details (measurements and health data) 
            to generate your personalized 30-day plan safely.
          </p>

          <p className="text-gray-600 text-sm mt-4">
            Let's get started! This will only take 2 minutes.
          </p>
        </motion.div>
      </Card>

      <Button onClick={onNext} className="w-full" size="lg">
        Calibrate My Plan →
      </Button>
    </div>
  )
}

