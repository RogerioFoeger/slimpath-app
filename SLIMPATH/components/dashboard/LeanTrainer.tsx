'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Sparkles } from 'lucide-react'

interface LeanTrainerProps {
  message: string
  microChallenge: string
}

export function LeanTrainer({ message, microChallenge }: LeanTrainerProps) {
  return (
    <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-lg p-2"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img 
              src="/logo.png" 
              alt="Lean AI Coach" 
              className="w-full h-full object-contain"
            />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">Lean</h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Your AI Coach
              </span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Micro Challenge */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">Today's Micro-Challenge</span>
          </div>
          <p className="text-white/90">{microChallenge}</p>
        </div>
      </div>
    </Card>
  )
}

