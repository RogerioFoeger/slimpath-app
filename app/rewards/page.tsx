'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, BonusContent } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BONUS_UNLOCK_THRESHOLD } from '@/lib/constants'
import { ArrowLeft, Gift, Lock, ExternalLink, Download } from 'lucide-react'
import { toast } from 'sonner'

interface UserBonusUnlock {
  id: string
  user_id: string
  bonus_content_id: string
  unlocked_at: string
}

export default function RewardsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [allBonuses, setAllBonuses] = useState<BonusContent[]>([])
  const [unlockedBonusIds, setUnlockedBonusIds] = useState<string[]>([])

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
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
      setUser(userProfile)

      // Fetch all active bonuses
      const { data: bonuses, error: bonusError } = await supabase
        .from('bonus_content')
        .select('*')
        .eq('is_active', true)
        .order('unlock_points')

      if (bonusError) throw bonusError
      setAllBonuses(bonuses || [])

      // Fetch user's unlocked bonuses
      const { data: unlocks, error: unlocksError } = await supabase
        .from('user_bonus_unlocks')
        .select('bonus_content_id')
        .eq('user_id', authUser.id)

      if (unlocksError) throw unlocksError
      setUnlockedBonusIds(unlocks?.map((u) => u.bonus_content_id) || [])

    } catch (error) {
      console.error('Error loading rewards:', error)
      toast.error('Failed to load rewards')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlockBonus = async (bonusId: string) => {
    if (!user) return

    try {
      // Check if user has already unlocked this bonus
      const { data: existing } = await supabase
        .from('user_bonus_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('bonus_content_id', bonusId)
        .maybeSingle()

      if (existing) {
        toast.info('You already unlocked this bonus!')
        return
      }

      // Create unlock record
      const { error } = await supabase
        .from('user_bonus_unlocks')
        .insert({
          user_id: user.id,
          bonus_content_id: bonusId,
        })

      if (error) throw error

      toast.success('🎁 Bonus unlocked!')
      await loadRewards()
    } catch (error) {
      console.error('Error unlocking bonus:', error)
      toast.error('Failed to unlock bonus')
    }
  }

  const getBonusStatus = (bonus: BonusContent) => {
    const isUnlocked = unlockedBonusIds.includes(bonus.id)
    const canUnlock = user && user.slim_points >= bonus.unlock_points && !isUnlocked
    const isLocked = user && user.slim_points < bonus.unlock_points

    return { isUnlocked, canUnlock, isLocked }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading user data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Your Rewards</h1>
                <p className="text-sm text-gray-600">Unlock bonuses with Slim Points</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Points Progress Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Your Slim Points</h2>
              <p className="text-white/90">Keep completing daily tasks to earn more points!</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">{user.slim_points}</div>
              <div className="text-sm text-white/90">Points</div>
            </div>
          </div>
          <ProgressBar
            value={user.slim_points}
            max={BONUS_UNLOCK_THRESHOLD}
            showLabel
            color="secondary"
          />
        </Card>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBonuses.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No bonuses available yet</p>
                  <p className="text-sm mt-2">Check back later for exciting rewards!</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            allBonuses.map((bonus) => {
              const { isUnlocked, canUnlock, isLocked } = getBonusStatus(bonus)

              return (
                <Card
                  key={bonus.id}
                  className={`relative overflow-hidden transition-all ${
                    isLocked ? 'opacity-60' : 'hover:shadow-xl'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gray-900/80 text-white p-2 rounded-full">
                        <Lock className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-green-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      UNLOCKED
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{bonus.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded">
                            {bonus.unlock_points} Points
                          </span>
                          <span className="text-xs text-gray-500">{bonus.content_type}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {bonus.description || 'Unlock this exclusive bonus content!'}
                    </p>

                    {isUnlocked ? (
                      <a
                        href={bonus.content_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Access Content
                      </a>
                    ) : canUnlock ? (
                      <Button
                        onClick={() => handleUnlockBonus(bonus.id)}
                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      >
                        <Gift className="w-4 h-4" />
                        Unlock Now
                      </Button>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">
                          {bonus.unlock_points - user.slim_points} more points needed
                        </p>
                        <div className="mt-2">
                          <ProgressBar
                            value={user.slim_points}
                            max={bonus.unlock_points}
                            color="primary"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Info Banner */}
        <Card className="mt-8 bg-gradient-to-r from-secondary-50 to-primary-50">
          <CardContent>
            <div className="flex items-start gap-3">
              <Gift className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">How to Earn More Points?</h3>
                <p className="text-sm text-gray-700">
                  Complete all your daily checklist tasks to earn +1 Slim Point each day. 
                  Keep your streak going to unlock all the amazing bonuses!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


