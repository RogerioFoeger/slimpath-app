'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { User, DailyContent, DailyTask, ProfileContent, UserDailyProgress, MoodCheckin as MoodCheckinType, MoodType, TimeOfDay } from '@/lib/types'
import { DailyChecklist } from '@/components/dashboard/DailyChecklist'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BONUS_UNLOCK_THRESHOLD } from '@/lib/constants'
import { getGreeting, getTodayString, calculateCurrentDay } from '@/lib/utils'
import { toast } from 'sonner'
import { LogOut, Bell, BellOff, Award, Gift } from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

// Lazy load heavy components
const LeanTrainer = dynamic(() => import('@/components/dashboard/LeanTrainer').then(mod => ({ default: mod.LeanTrainer })), { ssr: false })
const MoodCheckin = dynamic(() => import('@/components/dashboard/MoodCheckin').then(mod => ({ default: mod.MoodCheckin })), { ssr: false })
const NutritionModule = dynamic(() => import('@/components/dashboard/NutritionModule').then(mod => ({ default: mod.NutritionModule })), { ssr: false })
const PanicButton = dynamic(() => import('@/components/dashboard/PanicButton').then(mod => ({ default: mod.PanicButton })), { ssr: false })

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null)
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [profileContent, setProfileContent] = useState<ProfileContent | null>(null)
  const [progress, setProgress] = useState<UserDailyProgress | null>(null)
  const [todayCheckins, setTodayCheckins] = useState<MoodCheckinType[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const loadDashboard = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      // If user is authenticated, reset the logging out flag (in case they logged back in)
      if (authUser) {
        setIsLoggingOut(false)
      }
      
      if (!authUser) {
        // Don't show error if we're logging out
        if (!isLoggingOut) {
          router.push('/login')
        }
        return
      }
      
      // Don't load if we're logging out (but user is still authenticated - race condition)
      if (isLoggingOut) {
        return
      }

      // Check for onboarding completion flag from sessionStorage
      const justCompleted = sessionStorage.getItem('onboarding_just_completed')
      
      // Parallelize independent queries
      const [userResult, onboardingResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single(),
        supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle()
      ])

      const { data: userProfile, error: userError } = userResult
      const { data: onboarding, error: onboardingError } = onboardingResult

      if (userError) throw userError

      // If we just completed onboarding, clear the flag and continue
      if (justCompleted === 'true') {
        sessionStorage.removeItem('onboarding_just_completed')
        
        // If onboarding record still shows incomplete, wait a moment and retry once
        if (!onboarding || !onboarding.onboarding_completed) {
          console.log('Onboarding status not yet synced, retrying once...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: retryOnboarding } = await supabase
            .from('user_onboarding')
            .select('*')
            .eq('user_id', authUser.id)
            .maybeSingle()
          
          if (!retryOnboarding || !retryOnboarding.onboarding_completed) {
            console.error('Onboarding verification failed after retry')
            toast.error('Unable to verify onboarding completion. Please try again.')
            router.push('/onboarding')
            return
          }
        }
      } else {
        // Normal dashboard load - check onboarding status
        if (!onboarding || !onboarding.onboarding_completed) {
          console.log('Onboarding not completed, redirecting...', { onboarding, onboardingError })
          router.push('/onboarding')
          return
        }
      }

      // Calculate current day dynamically based on onboarding completion date
      const calculatedCurrentDay = calculateCurrentDay(onboarding?.completed_at || userProfile.created_at)
      
      // Update user's current_day in database if it's different (to keep it in sync)
      // Do this in parallel with other fetches if possible, but we need calculatedCurrentDay first
      const updatePromises: Promise<any>[] = []
      if (calculatedCurrentDay !== userProfile.current_day) {
        console.log(`Updating current_day from ${userProfile.current_day} to ${calculatedCurrentDay}`)
        updatePromises.push(
          supabase
            .from('users')
            .update({ current_day: calculatedCurrentDay })
            .eq('id', authUser.id)
            .then(({ error: updateDayError }) => {
              if (updateDayError) {
                console.error('Error updating current_day:', updateDayError)
              } else {
                userProfile.current_day = calculatedCurrentDay
              }
            })
        )
      }

      setUser(userProfile)

      const today = getTodayString()

      // Parallelize content fetches that depend on calculatedCurrentDay
      const [contentResult, progressResult, checkinsResult] = await Promise.all([
        supabase
          .from('daily_content')
          .select('*')
          .eq('day_number', calculatedCurrentDay)
          .single(),
        supabase
          .from('user_daily_progress')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('day_number', calculatedCurrentDay)
          .eq('date', today)
          .single(),
        supabase
          .from('mood_checkins')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('date', today)
      ])

      const { data: content, error: contentError } = contentResult
      let { data: todayProgress, error: progressError } = progressResult
      const { data: checkins, error: checkinsError } = checkinsResult

      if (contentError) throw contentError
      if (checkinsError) throw checkinsError
      if (progressError && progressError.code !== 'PGRST116') throw progressError

      setDailyContent(content)
      setTodayCheckins(checkins || [])

      // Fetch tasks and profile content in parallel (both depend on content.id)
      const [tasksResult, profContentResult] = await Promise.all([
        supabase
          .from('daily_tasks')
          .select('*')
          .eq('daily_content_id', content.id)
          .order('task_order'),
        supabase
          .from('profile_content')
          .select('*')
          .eq('daily_content_id', content.id)
          .eq('profile_type', userProfile.profile_type)
          .single()
      ])

      const { data: dailyTasks, error: tasksError } = tasksResult
      const { data: profContent, error: profError } = profContentResult

      if (tasksError) throw tasksError
      if (profError) throw profError

      setTasks(dailyTasks || [])
      setProfileContent(profContent)

      // Create progress if it doesn't exist
      if (!todayProgress) {
        const { data: newProgress, error: createError } = await supabase
          .from('user_daily_progress')
          .insert({
            user_id: authUser.id,
            day_number: calculatedCurrentDay,
            date: today,
            tasks_completed: [],
            tasks_total: dailyTasks?.length || 0,
            completion_percentage: 0,
            point_earned: false,
          })
          .select()
          .single()

        if (createError) throw createError
        todayProgress = newProgress
      }

      setProgress(todayProgress)

      // Wait for any pending updates
      await Promise.all(updatePromises)

    } catch (error: any) {
      // Don't show error toast if user is logging out
      if (isLoggingOut) {
        setLoading(false)
        return
      }
      
      // Double-check if user is still authenticated (might have been signed out during request)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        // User is not authenticated, silently redirect without showing error
        console.log('User not authenticated, redirecting to login')
        router.push('/login')
        setLoading(false)
        return
      }
      
      // Check if error is due to unauthenticated user (expected after logout)
      // This can happen if user was signed out while the request was in flight
      const isAuthError = 
        error?.message?.includes('JWT') || 
        error?.message?.includes('token') ||
        error?.message?.includes('unauthorized') ||
        error?.message?.includes('not authenticated') ||
        error?.code === 'PGRST301' ||
        error?.status === 401 ||
        error?.statusCode === 401
      
      if (isAuthError) {
        // User is not authenticated, silently redirect without showing error
        console.log('Authentication error detected, redirecting to login')
        router.push('/login')
        setLoading(false)
        return
      }
      
      // Only show error for other types of errors
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [router, supabase, isLoggingOut])

  useEffect(() => {
    // Load dashboard on mount (loadDashboard will check auth state and isLoggingOut)
    loadDashboard()

    // Listen for auth state changes (e.g., logout, login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsLoggingOut(true)
        setLoading(false) // Stop loading immediately
        // Don't call loadDashboard here, just redirect
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session) {
        // User logged back in, reset the flag and load dashboard
        setIsLoggingOut(false)
        loadDashboard()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadDashboard, router, supabase])

  const handleTaskToggle = useCallback(async (taskId: string, completed: boolean) => {
    if (!user || !progress) return

    // Optimistic update - update UI immediately
    const completedTasks = completed
      ? [...progress.tasks_completed, taskId]
      : progress.tasks_completed.filter((id) => id !== taskId)

    const completionPercentage = Math.round((completedTasks.length / tasks.length) * 100)
    const isFullyCompleted = completionPercentage === 100
    const shouldEarnPoint = isFullyCompleted && !progress.point_earned

    // Update local state immediately for instant feedback
    const updatedProgress = {
      ...progress,
      tasks_completed: completedTasks,
      completion_percentage: completionPercentage,
      point_earned: shouldEarnPoint || progress.point_earned,
    }
    setProgress(updatedProgress)

    // Update user state optimistically if earning a point
    if (shouldEarnPoint) {
      const newPoints = user.slim_points + 1
      const shouldUnlockBonus = newPoints >= BONUS_UNLOCK_THRESHOLD && !user.bonus_unlocked
      setUser({
        ...user,
        slim_points: newPoints,
        bonus_unlocked: shouldUnlockBonus || user.bonus_unlocked,
      })
    }

    try {
      // Update progress in database
      const { error: progressError } = await supabase
        .from('user_daily_progress')
        .update({
          tasks_completed: completedTasks,
          completion_percentage: completionPercentage,
          point_earned: shouldEarnPoint || progress.point_earned,
        })
        .eq('id', progress.id)

      if (progressError) throw progressError

      // If earning a point, update user's slim points
      if (shouldEarnPoint) {
        const newPoints = user.slim_points + 1
        const shouldUnlockBonus = newPoints >= BONUS_UNLOCK_THRESHOLD && !user.bonus_unlocked

        const { error: userError } = await supabase
          .from('users')
          .update({
            slim_points: newPoints,
            bonus_unlocked: shouldUnlockBonus || user.bonus_unlocked,
          })
          .eq('id', user.id)

        if (userError) throw userError

        toast.success('🎉 +1 Slim Point earned!')
        
        if (shouldUnlockBonus) {
          // Fetch eligible bonuses and auto-unlock them
          const { data: eligibleBonuses } = await supabase
            .from('bonus_content')
            .select('id')
            .eq('is_active', true)
            .lte('unlock_points', newPoints)

          if (eligibleBonuses && eligibleBonuses.length > 0) {
            // Get already unlocked bonuses
            const { data: alreadyUnlocked } = await supabase
              .from('user_bonus_unlocks')
              .select('bonus_content_id')
              .eq('user_id', user.id)

            const unlockedIds = alreadyUnlocked?.map(u => u.bonus_content_id) || []
            
            // Create unlock records for new bonuses
            const newUnlocks = eligibleBonuses
              .filter(b => !unlockedIds.includes(b.id))
              .map(b => ({
                user_id: user.id,
                bonus_content_id: b.id,
              }))

            if (newUnlocks.length > 0) {
              await supabase
                .from('user_bonus_unlocks')
                .insert(newUnlocks)
            }
          }

          toast.success('🎁 Bonus content unlocked! Check your rewards page!')
        }
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert optimistic update on error
      setProgress(progress)
      if (shouldEarnPoint) {
        setUser(user)
      }
      toast.error('Failed to update task')
    }
  }, [user, progress, tasks, supabase])

  const handleMoodCheckin = useCallback(async (mood: MoodType, timeOfDay: TimeOfDay, notes?: string) => {
    if (!user) return

    const newCheckin = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      mood,
      time_of_day: timeOfDay,
      notes,
      date: getTodayString(),
      created_at: new Date().toISOString(),
    } as MoodCheckinType

    // Optimistic update
    setTodayCheckins(prev => [...prev, newCheckin])

    try {
      const { data, error } = await supabase.from('mood_checkins').insert({
        user_id: user.id,
        mood,
        time_of_day: timeOfDay,
        notes,
        date: getTodayString(),
      }).select().single()

      if (error) throw error

      // Update with real data from server
      setTodayCheckins(prev => prev.map(c => c.id === newCheckin.id ? data : c))
      toast.success('Mood check-in saved!')
    } catch (error) {
      console.error('Error saving mood:', error)
      // Revert optimistic update
      setTodayCheckins(prev => prev.filter(c => c.id !== newCheckin.id))
      toast.error('Failed to save mood check-in')
    }
  }, [user, supabase])

  const handleNotificationToggle = useCallback(async () => {
    if (!user) return

    try {
      if (isSubscribed) {
        await unsubscribeFromPush()
        toast.success('Notifications disabled')
      } else {
        await subscribeToPush(user.id)
        toast.success('Notifications enabled')
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
      toast.error('Failed to update notifications')
    }
  }, [user, isSubscribed, subscribeToPush, unsubscribeFromPush])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    setLoading(false) // Stop loading state immediately
    try {
      // Sign out and redirect immediately - no delay needed
      supabase.auth.signOut().then(() => {
        router.push('/login')
      }).catch((error) => {
        console.error('Error during logout:', error)
        // Still redirect even if signOut fails
        router.push('/login')
      })
    } catch (error) {
      console.error('Error during logout:', error)
      router.push('/login')
    }
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Memoize expensive computations
  const greeting = useMemo(() => getGreeting(), [])
  const todayString = useMemo(() => getTodayString(), [])

  if (!user || !dailyContent || !profileContent || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading dashboard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/project_logo.png" 
              alt="SlimPath AI Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold gradient-text">SlimPath AI</h1>
              <p className="text-sm text-gray-600">{greeting}, {user.full_name}!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/rewards')}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
              title="View Your Rewards"
            >
              <Gift className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Rewards</span>
            </button>
            {isSupported && (
              <button
                onClick={handleNotificationToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
              >
                {isSubscribed ? (
                  <Bell className="w-5 h-5 text-primary-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Day Progress Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Day {user.current_day} of 30</h2>
              <p className="text-white/90">Keep up the amazing work!</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{user.slim_points}</div>
              <div className="text-sm text-white/90">Slim Points</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              value={user.slim_points}
              max={BONUS_UNLOCK_THRESHOLD}
              showLabel
              color="secondary"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-white/90">
                {user.bonus_unlocked
                  ? '🎉 Bonus unlocked! Check your rewards.'
                  : `${BONUS_UNLOCK_THRESHOLD - user.slim_points} points until bonus unlock`}
              </p>
              <button
                onClick={() => router.push('/rewards')}
                className="text-sm text-white/90 hover:text-white underline flex items-center gap-1"
              >
                <Gift className="w-4 h-4" />
                View Rewards
              </button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <LeanTrainer
              message={dailyContent.lean_message}
              microChallenge={dailyContent.micro_challenge}
            />

            <DailyChecklist
              tasks={tasks}
              completedTaskIds={progress.tasks_completed}
              onTaskToggle={handleTaskToggle}
              slimPoints={user.slim_points}
            />

            <PanicButton
              audioUrl={dailyContent.panic_button_audio_url}
              supportText={dailyContent.panic_button_text}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <NutritionModule profileContent={profileContent} />
            <MoodCheckin todayCheckins={todayCheckins} onCheckin={handleMoodCheckin} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 SlimPath AI. Your journey to a healthier you.</p>
          <p className="mt-2">
            Need help? Contact us at{' '}
            <a href="mailto:support@slimpathai.com" className="text-primary-500 hover:underline">
              support@slimpathai.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

