'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Attempt to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        })

        // If user already exists, try to sign them in instead
        if (signUpError) {
          console.log('Sign-up error:', signUpError.message)
          
          // Check if error is due to user already existing
          // Supabase can return various error messages for existing users
          const existingUserErrors = [
            'already registered',
            'already exists', 
            'User already registered',
            'user already exists',
            'email already exists',
            'duplicate',
            'already been registered'
          ]
          
          const isExistingUserError = existingUserErrors.some(errorText => 
            signUpError.message.toLowerCase().includes(errorText.toLowerCase())
          )

          if (isExistingUserError) {
            toast.info('Email already registered. Attempting to sign you in...')
            
            // Try to sign in with the provided credentials
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (signInError) {
              // If sign-in fails, the password is incorrect
              throw new Error('This email is already registered. Please use the "Sign In" option below with your existing password, or reset your password if you forgot it.')
            }

            // Sign-in successful, continue to check onboarding
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              const { data: onboarding } = await supabase
                .from('user_onboarding')
                .select('onboarding_completed')
                .eq('user_id', user.id)
                .single()

              toast.success('Welcome back!')
              if (onboarding?.onboarding_completed) {
                router.push('/dashboard')
              } else {
                router.push('/onboarding')
              }
            }
            return
          }
          
          // Other signup errors - log for debugging
          console.error('Unexpected signup error:', signUpError)
          throw signUpError
        }

        // Check if signup was successful or if user already exists
        // In some Supabase configurations, existing users don't throw errors
        if (signUpData?.user && !signUpData.user.identities?.length) {
          // User exists but signup didn't fail - try to sign in
          console.log('User exists (no error), attempting sign-in')
          toast.info('Email already registered. Attempting to sign you in...')
          
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            throw new Error('This email is already registered. Please use the "Sign In" option below with your existing password.')
          }

          // Sign-in successful
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: onboarding } = await supabase
              .from('user_onboarding')
              .select('onboarding_completed')
              .eq('user_id', user.id)
              .single()

            toast.success('Welcome back!')
            if (onboarding?.onboarding_completed) {
              router.push('/dashboard')
            } else {
              router.push('/onboarding')
            }
          }
          return
        }

        toast.success('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.log('Sign-in error:', error.message)
          
          // Provide more helpful error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. If you don\'t have an account yet, please use the "Sign Up" option below.')
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.')
          }
          throw error
        }

        // Check if user has completed onboarding
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: onboarding } = await supabase
            .from('user_onboarding')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single()

          toast.success('Welcome back!')
          if (onboarding?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="mx-auto mb-4 inline-block">
            <img 
              src="/logo.png" 
              alt="SlimPath AI Logo" 
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
              width="128"
              height="128"
              loading="eager"
              decoding="async"
              style={{ display: 'block' }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">SlimPath AI</h1>
          <p className="text-sm sm:text-base text-gray-600">Your Personal Weight Loss Journey</p>
        </div>

        <Card>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp
                  ? 'Start your transformation today'
                  : 'Continue your journey'}
              </p>
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary-500 hover:underline text-sm"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <LoginPageContent />
    </Suspense>
  )
}

