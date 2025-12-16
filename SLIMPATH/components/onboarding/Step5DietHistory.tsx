'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { OnboardingStep5Data } from '@/lib/types'
import { DIET_HISTORY_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Step5DietHistoryProps {
  onNext: (data: OnboardingStep5Data) => void
  onBack: () => void
}

export function Step5DietHistory({ onNext, onBack }: Step5DietHistoryProps) {
  const [selected, setSelected] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected) {
      onNext({ diet_history: selected })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Journey So Far
        </h2>
        <p className="text-gray-600">
          Just so I understand your moment... How has your experience 
          with diets been in the last year?
        </p>
      </div>

      <div className="space-y-3">
        {DIET_HISTORY_OPTIONS.map((option) => (
          <Card
            key={option.value}
            interactive
            className={cn(
              'p-4 border-2 transition-all',
              selected === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-transparent'
            )}
            onClick={() => setSelected(option.value)}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  selected === option.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                )}
              >
                {selected === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-primary-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          💭 <strong>Why this matters:</strong> Lean needs to know if I should be 
          more supportive or more challenging with you. Your past experience helps 
          me adjust my coaching style.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" onClick={onBack} variant="outline" className="w-full">
          ← Back
        </Button>
        <Button type="submit" className="w-full" disabled={!selected}>
          Next →
        </Button>
      </div>
    </form>
  )
}

