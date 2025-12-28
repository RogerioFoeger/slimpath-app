'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share2, ArrowDown } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      console.log('[PWA Install] Prompt was previously dismissed')
      return // User has dismissed it
    }

    // Detect iOS (iPad, iPhone, iPod)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    // Detect Android
    const android = /Android/.test(navigator.userAgent)

    console.log('[PWA Install] Device detection:', { iOS, android, userAgent: navigator.userAgent })

    setIsIOS(iOS)
    setIsAndroid(android)

    // Listen for beforeinstallprompt event (Android Chrome and other Chromium browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      console.log('[PWA Install] beforeinstallprompt event received')
      // Don't show prompt here - let the timeout below handle it
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt for all devices (iOS, Android, and desktop) immediately (with a small delay for better UX)
    // Note: Prompt will show even if app is already installed, as requested
    console.log('[PWA Install] Will show prompt in 1 second')
    const timeoutId = setTimeout(() => {
      console.log('[PWA Install] Showing prompt now')
      setShowPrompt(true)
    }, 1000)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-install-dismissed', 'true')
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error showing install prompt:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <Card className="max-w-md w-full relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 pt-8">
          {isIOS ? (
            // iOS Instructions
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Install SlimPath AI
                </h2>
                <p className="text-gray-600">
                  Add SlimPath AI to your home screen for quick access
                </p>
              </div>

              <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Share2 className="w-5 h-5 text-primary-500" />
                  </div>
                  <p className="text-gray-800 font-medium">
                    Tap the Share button (square with arrow) below.
                  </p>
                </div>

                {/* Animated Arrow */}
                <div className="flex justify-center py-4">
                  <div className="relative">
                    <ArrowDown className="w-8 h-8 text-primary-500 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600">1.</span>
                    <span>Scroll up and click &quot;Add to Home Screen&quot;.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600">2.</span>
                    <span>Click &quot;Add&quot;.</span>
                  </p>
                </div>
              </div>
            </div>
          ) : isAndroid ? (
            // Android Install Button
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Install SlimPath AI
                </h2>
                <p className="text-gray-600">
                  Get the full app experience on your device
                </p>
              </div>

              <Button
                onClick={handleInstallAndroid}
                className="w-full text-lg py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg"
                isLoading={isInstalling}
                disabled={isInstalling}
              >
                <Download className="w-6 h-6 mr-2" />
                {isInstalling ? 'Installing...' : '📲 Install App Now'}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Tap the button above to install SlimPath AI on your device
              </p>
            </div>
          ) : (
            // Generic fallback (for other browsers)
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Install SlimPath AI
                </h2>
                <p className="text-gray-600">
                  Add SlimPath AI to your home screen for quick access
                </p>
              </div>

              {deferredPrompt ? (
                <Button
                  onClick={handleInstallAndroid}
                  className="w-full text-lg py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg"
                  isLoading={isInstalling}
                  disabled={isInstalling}
                >
                  <Download className="w-6 h-6 mr-2" />
                  {isInstalling ? 'Installing...' : '📲 Install App Now'}
                </Button>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  <p className="mb-2 font-medium">To install this app:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Look for the install icon in your browser&apos;s address bar</li>
                    <li>Or use your browser&apos;s menu to &quot;Add to Home Screen&quot;</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

