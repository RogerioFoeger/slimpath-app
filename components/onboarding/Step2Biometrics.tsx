'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { OnboardingStep2Data } from '@/lib/types'

interface Step2BiometricsProps {
  onNext: (data: OnboardingStep2Data) => void
  onBack: () => void
}

export function Step2Biometrics({ onNext, onBack }: Step2BiometricsProps) {
  const [formData, setFormData] = useState<OnboardingStep2Data>({
    age: 0,
    height_cm: 0,
    current_weight_kg: 0,
    target_weight_kg: 0,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingStep2Data, string>>>({})

  const validate = () => {
    const newErrors: Partial<Record<keyof OnboardingStep2Data, string>> = {}

    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age (18-100)'
    }
    if (!formData.height_cm || formData.height_cm < 100 || formData.height_cm > 250) {
      newErrors.height_cm = 'Please enter a valid height (100-250 cm)'
    }
    if (!formData.current_weight_kg || formData.current_weight_kg < 30 || formData.current_weight_kg > 300) {
      newErrors.current_weight_kg = 'Please enter a valid current weight (30-300 kg)'
    }
    if (!formData.target_weight_kg || formData.target_weight_kg < 30 || formData.target_weight_kg > 300) {
      newErrors.target_weight_kg = 'Please enter a valid target weight (30-300 kg)'
    }
    if (formData.target_weight_kg >= formData.current_weight_kg) {
      newErrors.target_weight_kg = 'Target weight must be less than current weight'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📏</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Measurements
        </h2>
        <p className="text-gray-600">
          To calculate your exact hydration targets and workout intensity, I need your current measurements.
        </p>
      </div>

      <Card className="space-y-4">
        <Input
          type="number"
          label="Age"
          placeholder="Enter your age"
          value={formData.age || ''}
          onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
          error={errors.age}
        />

        <Input
          type="number"
          label="Height (cm)"
          placeholder="Enter your height in centimeters"
          value={formData.height_cm || ''}
          onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
          error={errors.height_cm}
        />

        <Input
          type="number"
          step="0.1"
          label="Current Weight (kg)"
          placeholder="Enter your current weight"
          value={formData.current_weight_kg || ''}
          onChange={(e) => setFormData({ ...formData, current_weight_kg: Number(e.target.value) })}
          error={errors.current_weight_kg}
        />

        <Input
          type="number"
          step="0.1"
          label="Target Weight (kg)"
          placeholder="Enter your goal weight"
          value={formData.target_weight_kg || ''}
          onChange={(e) => setFormData({ ...formData, target_weight_kg: Number(e.target.value) })}
          error={errors.target_weight_kg}
        />

        <div className="bg-secondary-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> Be honest with your measurements. This helps me create 
            a safe and effective plan tailored specifically for you.
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

