'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Check, Zap, Target, Award } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: onboarding } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (onboarding?.onboarding_completed) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    }
    checkUser()

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-8 text-center">
          <img 
            src="/logo.png" 
            alt="SlimPath AI Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl mx-auto"
            width="192"
            height="192"
            loading="eager"
            decoding="async"
            style={{ display: 'block' }}
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">SlimPath AI</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
          Your Personal AI-Powered Weight Loss Journey
        </p>

        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your habits with personalized guidance, daily micro-actions, 
          and intelligent coaching tailored to your unique metabolic profile.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => router.push('/login')}>
            Get Started →
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            30-Day Program
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            AI-Powered
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Personalized
          </span>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why SlimPath AI Works
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Profile-Based</h3>
            <p className="text-gray-600">
              6 unique metabolic profiles with customized strategies for each type
            </p>
          </Card>

          <Card className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 flex items-center justify-center">
              <Zap className="w-8 h-8 text-secondary-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Daily Micro-Actions</h3>
            <p className="text-gray-600">
              Small, achievable tasks that build lasting habits without overwhelming you
            </p>
          </Card>

          <Card className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Gamified Progress</h3>
            <p className="text-gray-600">
              Earn Slim Points and unlock exclusive content as you progress
            </p>
          </Card>

          <Card className="text-center">
            <div className="mx-auto mb-4 inline-block">
              <img 
                src="/logo.png" 
                alt="Lean AI Coach" 
                className="w-16 h-16 object-contain"
                width="64"
                height="64"
                loading="lazy"
                style={{ display: 'block' }}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Coach - Lean</h3>
            <p className="text-gray-600">
              24/7 support, motivation, and guidance from your personal AI companion
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Plan
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="text-center p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-4">Monthly</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">$37</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>30-day personalized program</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Daily AI coaching</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Custom meal plans</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Progress tracking</span>
              </li>
            </ul>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Start Monthly
            </Button>
          </Card>

          <Card className="text-center p-8 border-2 border-primary-500 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>
            <h3 className="text-2xl font-bold mb-4">Annual</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">$297</span>
              <span className="text-gray-600">/year</span>
              <p className="text-sm text-green-600 font-semibold mt-2">
                Save $147 per year!
              </p>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Everything in Monthly</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Exclusive content</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Advanced analytics</span>
              </li>
            </ul>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Start Annual
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">SlimPath AI</h3>
          <p className="text-gray-400 mb-6">
            Your journey to a healthier, happier you starts here.
          </p>
          <div className="flex justify-center gap-6 mb-6">
            <a href="mailto:support@slimpathai.com" className="text-gray-400 hover:text-white transition-colors">
              Support
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 SlimPath AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

