'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { OnboardingStep4Data } from '@/lib/types'
import { DIETARY_RESTRICTIONS } from '@/lib/constants'

interface Step4NutritionFilterProps {
  onNext: (data: OnboardingStep4Data) => void
  onBack: () => void
  profileType: string
}

export function Step4NutritionFilter({ onNext, onBack, profileType }: Step4NutritionFilterProps) {
  const [formData, setFormData] = useState<OnboardingStep4Data>({
    dietary_restrictions: [],
  })

  const handleRestrictionToggle = (restriction: string) => {
    setFormData((prev) => {
      const dietary_restrictions = prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter((r) => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
      return { ...prev, dietary_restrictions }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🥗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nutrition Preferences
        </h2>
        <p className="text-gray-600">
          I'll create meal plans to unlock your {profileType} Type. 
          Is there anything you can't or don't want to eat?
        </p>
      </div>

      <Card className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Select your dietary restrictions (if any):
        </h3>
        
        <div className="space-y-2">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <Checkbox
              key={restriction}
              label={restriction}
              checked={formData.dietary_restrictions.includes(restriction)}
              onChange={() => handleRestrictionToggle(restriction)}
            />
          ))}
        </div>

        <div className="bg-secondary-50 p-3 rounded-lg mt-4">
          <p className="text-sm text-gray-700">
            💡 <strong>No one follows a diet with food they don't like!</strong> 
            Your meal plans will respect your preferences while helping you reach your goals.
          </p>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="button" onClick={onBack} variant="outline" className="w-full">
          ← Back
        </Button>
        <Button type="submit" className="w-full">
          Next →
        </Button>
      </div>
    </form>
  )
}

