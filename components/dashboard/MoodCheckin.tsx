'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MoodType, TimeOfDay } from '@/lib/types'
import { MOODS, TIMES_OF_DAY } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MoodCheckinProps {
  todayCheckins: { time_of_day: TimeOfDay; mood: MoodType }[]
  onCheckin: (mood: MoodType, timeOfDay: TimeOfDay, notes?: string) => void
}

export function MoodCheckin({ todayCheckins, onCheckin }: MoodCheckinProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [selectedTime, setSelectedTime] = useState<TimeOfDay | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTimes = TIMES_OF_DAY.filter(
    (time) => !todayCheckins.some((c) => c.time_of_day === time.value)
  )

  const handleSubmit = async () => {
    if (!selectedMood || !selectedTime) return

    setIsSubmitting(true)
    try {
      await onCheckin(selectedMood, selectedTime, notes)
      setSelectedMood(null)
      setSelectedTime(null)
      setNotes('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Check-in</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Track your emotional state up to 3 times per day
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Show completed check-ins */}
        {todayCheckins.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Today&apos;s Check-ins:</p>
            <div className="flex gap-2 flex-wrap">
              {todayCheckins.map((checkin, index) => {
                const timeInfo = TIMES_OF_DAY.find((t) => t.value === checkin.time_of_day)
                const moodInfo = MOODS.find((m) => m.value === checkin.mood)
                return (
                  <div
                    key={index}
                    className="bg-primary-50 px-3 py-2 rounded-lg flex items-center gap-2"
                  >
                    <span>{timeInfo?.icon}</span>
                    <span className="text-2xl">{moodInfo?.emoji}</span>
                    <span className="text-sm font-medium">{timeInfo?.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {availableTimes.length === 0 ? (
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-900 font-semibold">
              ✅ All check-ins completed for today!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Come back tomorrow to track your mood again.
            </p>
          </div>
        ) : (
          <>
            {/* Time of Day Selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">When:</p>
              <div className="flex gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setSelectedTime(time.value as TimeOfDay)}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-all',
                      selectedTime === time.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    )}
                  >
                    <div className="text-2xl mb-1">{time.icon}</div>
                    <div className="text-sm font-medium">{time.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">How are you feeling:</p>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value as MoodType)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      selectedMood === mood.value
                        ? 'border-primary-500 bg-primary-50 scale-110'
                        : 'border-gray-200 hover:border-primary-300'
                    )}
                    title={mood.label}
                  >
                    <div className="text-3xl">{mood.emoji}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes (optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling today?"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                rows={2}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || !selectedTime || isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              Save Check-in
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

