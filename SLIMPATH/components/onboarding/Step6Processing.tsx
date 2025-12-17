'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Check } from 'lucide-react'

interface Step6ProcessingProps {
  onComplete: () => void
}

const PROCESSING_STEPS = [
  'Importing data from Scanner...',
  'Adjusting meal plans...',
  'Calculating basal metabolic rate...',
  'Configuring hydration targets...',
  'Defining Day 1 Micro-Actions...',
  'Personalizing workout intensity...',
]

export function Step6Processing({ onComplete }: Step6ProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (currentStep < PROCESSING_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (!completed) {
      setCompleted(true)
      setTimeout(() => {
        onComplete()
      }, 1500)
    }
  }, [currentStep, completed, onComplete])

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          25% {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          50% {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          75% {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
          100% {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        }
      `}</style>
      <div className="text-center mb-8">
        <motion.div
          className={cn(
            "w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center p-3",
            completed ? "bg-gradient-to-br from-green-400 to-green-600" : ""
          )}
          style={
            !completed
              ? {
                  animation: 'gradientShift 4s ease-in-out infinite',
                  backgroundSize: '200% 200%',
                }
              : undefined
          }
          animate={{
            scale: completed ? 1.1 : 1,
          }}
          transition={{
            scale: { duration: 0.3 },
          }}
        >
          {completed ? (
            <Check className="w-12 h-12 text-white" />
          ) : (
            <img 
              src="/logo.png" 
              alt="Lean AI Coach" 
              className="w-full h-full object-contain"
            />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {completed ? 'All Set! 🎉' : 'Creating Your Plan...'}
        </h2>
        <p className="text-gray-600">
          {completed
            ? 'Your personalized 30-day plan is ready!'
            : 'Lean is analyzing your data and building your custom program'}
        </p>
      </div>

      <Card className="space-y-3">
        {PROCESSING_STEPS.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: index <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-primary-500 animate-pulse'
                  : 'bg-gray-300'
              )}
            >
              {index < currentStep && <Check className="w-4 h-4 text-white" />}
            </div>
            <span
              className={cn(
                'text-sm',
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {step}
            </span>
          </motion.div>
        ))}
      </Card>

      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-secondary text-white p-6 rounded-2xl text-center"
        >
          <p className="font-semibold text-lg">
            ✅ Plan Generated Successfully!
          </p>
          <p className="text-sm mt-2 opacity-90">
            Redirecting you to your dashboard...
          </p>
        </motion.div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

