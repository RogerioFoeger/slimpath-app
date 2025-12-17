'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AlertCircle, Play, Pause } from 'lucide-react'

interface PanicButtonProps {
  audioUrl?: string
  supportText?: string
}

export function PanicButton({ audioUrl, supportText }: PanicButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="danger"
        size="lg"
        className="w-full shadow-large animate-pulse-slow"
      >
        <AlertCircle className="w-6 h-6" />
        SOS - Need Support Now
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="You're Not Alone"
        size="md"
      >
        <div className="space-y-6">
          {/* Calming Message */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-4xl">🤗</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Take a Deep Breath
            </h3>
            <p className="text-gray-700">
              {supportText || "It's okay to feel this way. Let's take a moment together to calm down and refocus."}
            </p>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl">
              <p className="text-sm text-gray-700 mb-4 text-center">
                Listen to this guided audio to help you relax:
              </p>
              
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <Button
                onClick={toggleAudio}
                variant="primary"
                className="w-full"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause Audio
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Play Calming Audio
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Quick Tips */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Quick calming techniques:</p>
            <div className="space-y-2">
              {[
                '🌬️ Take 5 slow, deep breaths',
                '💧 Drink a glass of water slowly',
                '🚶 Take a short 5-minute walk',
                '📝 Write down what you\'re feeling',
                '🤗 Remember why you started this journey',
              ].map((tip, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-lg border border-gray-200"
                >
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact Info */}
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-gray-700">
              <strong>Remember:</strong> SlimPath is here to support you, 
              but if you&apos;re experiencing severe anxiety or distress, 
              please reach out to a healthcare professional.
            </p>
          </div>

          <Button onClick={handleClose} variant="outline" className="w-full">
            I&apos;m Feeling Better
          </Button>
        </div>
      </Modal>
    </>
  )
}
