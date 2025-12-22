'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, DailyContent, DailyTask, ProfileContent, UserDailyProgress, MoodCheckin as MoodCheckinType, MoodType, TimeOfDay } from '@/lib/types'
import { LeanTrainer } from '@/components/dashboard/LeanTrainer'
import { DailyChecklist } from '@/components/dashboard/DailyChecklist'
import { MoodCheckin } from '@/components/dashboard/MoodCheckin'
import { NutritionModule } from '@/components/dashboard/NutritionModule'
import { PanicButton } from '@/components/dashboard/PanicButton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BONUS_UNLOCK_THRESHOLD } from '@/lib/constants'
import { getGreeting, getTodayString, calculateCurrentDay } from '@/lib/utils'
import { toast } from 'sonner'
import { LogOut, Bell, BellOff, Award, Gift } from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

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

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      // Fetch user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) throw userError

      // Check for onboarding completion flag from sessionStorage
      const justCompleted = sessionStorage.getItem('onboarding_just_completed')
      
      // Check if onboarding is completed
      const { data: onboarding, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle()

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
      if (calculatedCurrentDay !== userProfile.current_day) {
        console.log(`Updating current_day from ${userProfile.current_day} to ${calculatedCurrentDay}`)
        const { error: updateDayError } = await supabase
          .from('users')
          .update({ current_day: calculatedCurrentDay })
          .eq('id', authUser.id)
        
        if (updateDayError) {
          console.error('Error updating current_day:', updateDayError)
        } else {
          userProfile.current_day = calculatedCurrentDay
        }
      }

      setUser(userProfile)

      // Fetch daily content for user's current day
      const { data: content, error: contentError } = await supabase
        .from('daily_content')
        .select('*')
        .eq('day_number', calculatedCurrentDay)
        .single()

      if (contentError) throw contentError
      setDailyContent(content)

      // Fetch tasks for this day
      const { data: dailyTasks, error: tasksError } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('daily_content_id', content.id)
        .order('task_order')

      if (tasksError) throw tasksError
      setTasks(dailyTasks || [])

      // Fetch profile-specific content
      const { data: profContent, error: profError } = await supabase
        .from('profile_content')
        .select('*')
        .eq('daily_content_id', content.id)
        .eq('profile_type', userProfile.profile_type)
        .single()

      if (profError) throw profError
      setProfileContent(profContent)

      // Fetch or create today's progress
      const today = getTodayString()
      let { data: todayProgress, error: progressError } = await supabase
        .from('user_daily_progress')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('day_number', calculatedCurrentDay)
        .eq('date', today)
        .single()

      if (progressError && progressError.code !== 'PGRST116') throw progressError

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

      // Fetch today's mood check-ins
      const { data: checkins, error: checkinsError } = await supabase
        .from('mood_checkins')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('date', today)

      if (checkinsError) throw checkinsError
      setTodayCheckins(checkins || [])

    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user || !progress) return

    try {
      const completedTasks = completed
        ? [...progress.tasks_completed, taskId]
        : progress.tasks_completed.filter((id) => id !== taskId)

      const completionPercentage = Math.round((completedTasks.length / tasks.length) * 100)
      const isFullyCompleted = completionPercentage === 100
      const shouldEarnPoint = isFullyCompleted && !progress.point_earned

      // Update progress
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

      await loadDashboard()
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleMoodCheckin = async (mood: MoodType, timeOfDay: TimeOfDay, notes?: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('mood_checkins').insert({
        user_id: user.id,
        mood,
        time_of_day: timeOfDay,
        notes,
        date: getTodayString(),
      })

      if (error) throw error

      toast.success('Mood check-in saved!')
      await loadDashboard()
    } catch (error) {
      console.error('Error saving mood:', error)
      toast.error('Failed to save mood check-in')
    }
  }

  const handleNotificationToggle = async () => {
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
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
              <p className="text-sm text-gray-600">{getGreeting()}, {user.full_name}!</p>
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

