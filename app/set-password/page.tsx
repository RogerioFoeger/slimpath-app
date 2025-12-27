'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { toast } from 'sonner'

function SetPasswordPageContent() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Handle magic link authentication callback
        // Check if there are auth tokens in the URL hash (from magic link)
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
        
        // Get current user (should be authenticated now)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.log('No authenticated user found, redirecting to login')
          router.push('/login')
          return
        }

        // Check if user already has a password set
        // If password is already set, redirect to onboarding
        if (user.user_metadata?.password_set) {
          console.log('✅ User already has password set, redirecting to onboarding...')
          router.push('/onboarding')
          return
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error initializing password setup:', error)
        toast.error('Failed to load password setup')
        router.push('/login')
      }
    }

    initAuth()
  }, [router, supabase])

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setConfirmPasswordError('')

    // Validate password
    const pwdError = validatePassword(password)
    if (pwdError) {
      setPasswordError(pwdError)
      return
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    setSaving(true)

    try {
      // Update user password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          password_set: true, // Flag to indicate password has been set
        },
      })

      if (updateError) {
        console.error('Error updating password:', updateError)
        toast.error(updateError.message || 'Failed to set password. Please try again.')
        setSaving(false)
        return
      }

      toast.success('Password set successfully!')
      
      // Redirect to onboarding
      router.push('/onboarding')
    } catch (error) {
      console.error('Error setting password:', error)
      toast.error('Failed to set password. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center mb-6">
            Please set a password for your account. You'll use this to sign in to the app.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError('')
              }}
              error={passwordError}
              required
              disabled={saving}
            />
            
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmPasswordError('')
              }}
              error={confirmPasswordError}
              required
              disabled={saving}
            />

            <div className="text-sm text-gray-500 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={saving}
              disabled={saving || !password || !confirmPassword}
            >
              Set Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <SetPasswordPageContent />
    </Suspense>
  )
}

