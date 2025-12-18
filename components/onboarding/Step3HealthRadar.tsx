'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { OnboardingStep3Data } from '@/lib/types'
import { MEDICATIONS, PHYSICAL_LIMITATIONS } from '@/lib/constants'

interface Step3HealthRadarProps {
  onNext: (data: OnboardingStep3Data) => void
  onBack: () => void
}

export function Step3HealthRadar({ onNext, onBack }: Step3HealthRadarProps) {
  const [formData, setFormData] = useState<OnboardingStep3Data>({
    medications: [],
    physical_limitations: [],
  })

  const handleMedicationToggle = (medication: string) => {
    setFormData((prev) => {
      const medications = prev.medications.includes(medication)
        ? prev.medications.filter((m) => m !== medication)
        : [...prev.medications, medication]
      return { ...prev, medications }
    })
  }

  const handleLimitationToggle = (limitation: string) => {
    setFormData((prev) => {
      const physical_limitations = prev.physical_limitations.includes(limitation)
        ? prev.physical_limitations.filter((l) => l !== limitation)
        : [...prev.physical_limitations, limitation]
      return { ...prev, physical_limitations }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🏥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Health & Safety First
        </h2>
        <p className="text-gray-600">
          SlimPath needs to know what&apos;s already working in your body to avoid conflicts.
        </p>
      </div>

      <Card className="space-y-6">
        {/* Medications Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Do you use any medications continuously?
          </h3>
          <div className="space-y-2">
            {MEDICATIONS.map((medication) => (
              <Checkbox
                key={medication}
                label={medication}
                checked={formData.medications.includes(medication)}
                onChange={() => handleMedicationToggle(medication)}
              />
            ))}
          </div>
        </div>

        {/* Physical Limitations Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Do you have any injuries or physical limitations?
          </h3>
          <div className="space-y-2">
            {PHYSICAL_LIMITATIONS.map((limitation) => (
              <Checkbox
                key={limitation}
                label={limitation}
                checked={formData.physical_limitations.includes(limitation)}
                onChange={() => handleLimitationToggle(limitation)}
              />
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
          <p className="text-sm text-gray-700">
            ⚠️ <strong>Important:</strong> This information helps us customize your 
            workout plans to avoid exercises that could cause injury or interact 
            with your medications.
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

