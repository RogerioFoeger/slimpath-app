'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
}

export function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* Header with Logo */}
      <header className="p-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-block">
              <img 
                src="/logo.png" 
                alt="SlimPath AI Logo" 
                className="w-10 h-10 object-contain"
                width="40"
                height="40"
                loading="eager"
                style={{ display: 'block' }}
              />
            </div>
            <span className="text-xl font-bold gradient-text">SlimPath AI</span>
          </div>
          <span className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200">
        <motion.div
          className="h-full bg-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        <p>© 2025 SlimPath AI. Your journey to a healthier you.</p>
      </footer>
    </div>
  )
}

