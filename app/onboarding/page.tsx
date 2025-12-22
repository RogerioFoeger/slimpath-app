'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { Step1Welcome } from '@/components/onboarding/Step1Welcome'
import { Step2Biometrics } from '@/components/onboarding/Step2Biometrics'
import { Step3HealthRadar } from '@/components/onboarding/Step3HealthRadar'
import { Step4NutritionFilter } from '@/components/onboarding/Step4NutritionFilter'
import { Step5DietHistory } from '@/components/onboarding/Step5DietHistory'
import { Step6Processing } from '@/components/onboarding/Step6Processing'
import { Step7Welcome } from '@/components/onboarding/Step7Welcome'
import { createClient } from '@/lib/supabase/client'
import { UserProfileType, OnboardingStep2Data, OnboardingStep3Data, OnboardingStep4Data, OnboardingStep5Data } from '@/lib/types'
import { calculateBMI } from '@/lib/utils'
import { toast } from 'sonner'

function OnboardingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('there')
  const [profileType, setProfileType] = useState<UserProfileType>('hormonal')
  
  const [onboardingData, setOnboardingData] = useState({
    step2: null as OnboardingStep2Data | null,
    step3: null as OnboardingStep3Data | null,
    step4: null as OnboardingStep4Data | null,
    step5: null as OnboardingStep5Data | null,
  })

  const supabase = createClient()

  useEffect(() => {
    const initOnboarding = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (!profile) {
          toast.error('User profile not found')
          router.push('/login')
          return
        }

        setUserId(profile.id)
        setUserName(profile.full_name || 'there')
        setProfileType(profile.profile_type)

        // Check if onboarding is already completed
        // Use maybeSingle to handle cases where no record exists yet
        const { data: onboarding } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (onboarding?.onboarding_completed) {
          // Only redirect if we're not in the middle of a completion flow
          router.push('/dashboard')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Error initializing onboarding:', error)
        toast.error('Failed to load onboarding')
        setLoading(false)
      }
    }

    initOnboarding()
  }, [router, supabase])

  const handleStep2Complete = (data: OnboardingStep2Data) => {
    setOnboardingData(prev => ({ ...prev, step2: data }))
    setCurrentStep(3)
  }

  const handleStep3Complete = (data: OnboardingStep3Data) => {
    setOnboardingData(prev => ({ ...prev, step3: data }))
    setCurrentStep(4)
  }

  const handleStep4Complete = (data: OnboardingStep4Data) => {
    setOnboardingData(prev => ({ ...prev, step4: data }))
    setCurrentStep(5)
  }

  const handleStep5Complete = (data: OnboardingStep5Data) => {
    setOnboardingData(prev => ({ ...prev, step5: data }))
    setCurrentStep(6)
  }

  const handleProcessingComplete = async () => {
    try {
      // Save onboarding data to database
      const step2 = onboardingData.step2!
      const bmi = calculateBMI(step2.current_weight_kg, step2.height_cm)

      // Use upsert to handle both new and existing records
      // This requires a unique constraint on user_id (should be set via SQL migration)
      const { error: onboardingError } = await supabase.from('user_onboarding').upsert({
        user_id: userId,
        age: step2.age,
        height_cm: step2.height_cm,
        current_weight_kg: step2.current_weight_kg,
        target_weight_kg: step2.target_weight_kg,
        bmi,
        medications: onboardingData.step3!.medications,
        physical_limitations: onboardingData.step3!.physical_limitations,
        dietary_restrictions: onboardingData.step4!.dietary_restrictions,
        diet_history: onboardingData.step5!.diet_history,
        onboarding_completed: true,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

      if (onboardingError) {
        console.error('Error saving onboarding:', onboardingError)
        toast.error('Failed to save your information. Please try again.')
        throw onboardingError
      }

      // Initialize day 1 progress
      const { error: progressError } = await supabase.from('user_daily_progress').insert({
        user_id: userId,
        day_number: 1,
        date: new Date().toISOString().split('T')[0],
        tasks_completed: [],
        tasks_total: 0,
        completion_percentage: 0,
        point_earned: false,
      })

      if (progressError) {
        console.error('Error creating daily progress:', progressError)
        // Don't fail if progress already exists
        if (progressError.code !== '23505') { // 23505 is unique constraint violation
          toast.error('Failed to initialize daily progress. Please try again.')
          throw progressError
        }
      }

      // Verify onboarding was saved successfully
      const { data: verifyOnboarding, error: verifyError } = await supabase
        .from('user_onboarding')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (verifyError || !verifyOnboarding?.onboarding_completed) {
        console.error('Onboarding verification failed:', verifyError)
        toast.error('Failed to complete onboarding. Please try again.')
        throw new Error('Onboarding not properly saved')
      }

      // Only proceed to step 7 if everything succeeded
      setCurrentStep(7)
    } catch (error) {
      console.error('Error in onboarding completion:', error)
      // Keep user on step 6 so they can try again
    }
  }

  const handleStartDashboard = async () => {
    try {
      // Force a fresh query with cache bypass
      const { data: onboarding, error } = await supabase
        .from('user_onboarding')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error verifying onboarding:', error)
        toast.error('Unable to verify onboarding status. Please try again.')
        return
      }

      if (!onboarding?.onboarding_completed) {
        toast.error('Onboarding not properly completed. Please try again.')
        setCurrentStep(6) // Go back to processing step
        return
      }

      // Set a flag in sessionStorage to prevent onboarding check redirect
      sessionStorage.setItem('onboarding_just_completed', 'true')

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error starting dashboard:', error)
      toast.error('Failed to navigate to dashboard. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={7}>
      {currentStep === 1 && (
        <Step1Welcome
          profileType={profileType}
          userName={userName}
          onNext={() => setCurrentStep(2)}
        />
      )}
      
      {currentStep === 2 && (
        <Step2Biometrics
          onNext={handleStep2Complete}
          onBack={() => setCurrentStep(1)}
        />
      )}
      
      {currentStep === 3 && (
        <Step3HealthRadar
          onNext={handleStep3Complete}
          onBack={() => setCurrentStep(2)}
        />
      )}
      
      {currentStep === 4 && (
        <Step4NutritionFilter
          profileType={profileType}
          onNext={handleStep4Complete}
          onBack={() => setCurrentStep(3)}
        />
      )}
      
      {currentStep === 5 && (
        <Step5DietHistory
          onNext={handleStep5Complete}
          onBack={() => setCurrentStep(4)}
        />
      )}
      
      {currentStep === 6 && (
        <Step6Processing onComplete={handleProcessingComplete} />
      )}
      
      {currentStep === 7 && (
        <Step7Welcome
          userName={userName}
          profileType={profileType}
          onStart={handleStartDashboard}
        />
      )}
    </OnboardingLayout>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <OnboardingPageContent />
    </Suspense>
  )
}

