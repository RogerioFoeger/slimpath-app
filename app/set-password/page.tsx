'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

function SetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // Get redirect URL from query params, default to onboarding
  const redirectTo = searchParams.get('redirect') || '/onboarding'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Handle magic link authentication callback if present
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Magic link callback - exchange tokens for session
          console.log('🔗 Processing magic link authentication...')
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (sessionError) {
            console.error('Error setting session from magic link:', sessionError)
            toast.error('Failed to authenticate. Please try again.')
            router.push('/login')
            return
          }
          
          // Clear the hash from URL after processing
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          
          console.log('✅ Magic link authentication successful')
        }
        
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.log('No authenticated user found, redirecting to login')
          router.push('/login')
          return
        }

        setCheckingAuth(false)
      } catch (error) {
        console.error('Error checking authentication:', error)
        toast.error('Failed to verify authentication')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate passwords
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error('Error setting password:', updateError)
        toast.error('Failed to set password. Please try again.')
        setLoading(false)
        return
      }

      toast.success('Password set successfully!')
      
      // Redirect to the specified page (default: onboarding)
      router.push(redirectTo)
    } catch (error) {
      console.error('Error setting password:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Set Your Password
            </h1>
            <p className="text-gray-600">
              Please create a password to secure your account before continuing to onboarding.
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />

            <div className="text-sm text-gray-500">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 8 characters long</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Set Password & Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SetPasswordPageContent />
    </Suspense>
  )
}

