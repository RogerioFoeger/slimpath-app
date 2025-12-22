'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DailyContent, DailyTask, ProfileContent, BonusContent, UserProfileType } from '@/lib/types'
import { PROFILE_TYPES } from '@/lib/constants'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Save, Gift, Calendar, Filter } from 'lucide-react'

type AdminTab = 'content' | 'bonuses'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTab>('content')
  const [dailyContents, setDailyContents] = useState<DailyContent[]>([])
  const [bonusContents, setBonusContents] = useState<BonusContent[]>([])
  const [profileContents, setProfileContents] = useState<ProfileContent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedProfileType, setSelectedProfileType] = useState<UserProfileType | 'all'>('all')
  const [editingContent, setEditingContent] = useState<Partial<DailyContent> | null>(null)
  const [editingBonus, setEditingBonus] = useState<Partial<BonusContent> | null>(null)
  const [editingProfileContents, setEditingProfileContents] = useState<Record<UserProfileType, Partial<ProfileContent>>>({} as Record<UserProfileType, Partial<ProfileContent>>)

  const loadContent = useCallback(async () => {
    setLoading(true)
    
    // Load daily content
    try {
      const { data: contentData, error: contentError } = await supabase
        .from('daily_content')
        .select('*')
        .order('day_number')

      if (contentError) {
        console.error('Error loading daily content:', contentError)
        toast.error(`Failed to load daily content: ${contentError.message}`)
        setDailyContents([])
      } else {
        setDailyContents(contentData || [])
      }
    } catch (error: any) {
      console.error('Unexpected error loading daily content:', error)
      toast.error(`Failed to load daily content: ${error?.message || 'Unknown error'}`)
      setDailyContents([])
    }

    // Load profile content (optional - might be empty)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profile_content')
        .select('*')
        .order('daily_content_id', { ascending: true })

      if (profileError) {
        console.error('Error loading profile content:', profileError)
        // Don't show error toast for profile content - it might not exist yet or table might be empty
        console.warn('Profile content load failed (this is OK if table is empty):', profileError.message)
        setProfileContents([])
      } else {
        setProfileContents(profileData || [])
      }
    } catch (error: any) {
      console.error('Unexpected error loading profile content:', error)
      // Silently fail for profile content - it's optional
      setProfileContents([])
    }

    // Load bonus content
    try {
      const { data: bonusData, error: bonusError } = await supabase
        .from('bonus_content')
        .select('*')
        .order('unlock_points')

      if (bonusError) {
        console.error('Error loading bonus content:', bonusError)
        toast.error(`Failed to load bonus content: ${bonusError.message}`)
        setBonusContents([])
      } else {
        setBonusContents(bonusData || [])
      }
    } catch (error: any) {
      console.error('Unexpected error loading bonus content:', error)
      toast.error(`Failed to load bonus content: ${error?.message || 'Unknown error'}`)
      setBonusContents([])
    }

    setLoading(false)
  }, [supabase])

  const checkAuthAndLoad = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Not authenticated:', authError)
        toast.error('Please log in to access the admin panel')
        router.push('/login')
        return
      }

      await loadContent()
    } catch (error: any) {
      console.error('Error checking authentication:', error)
      toast.error('Failed to verify authentication')
      setLoading(false)
    }
  }, [router, supabase, loadContent])

  useEffect(() => {
    checkAuthAndLoad()
  }, [checkAuthAndLoad])

  const handleSaveContent = async () => {
    if (!editingContent) return

    try {
      let dailyContentId: string

      if (editingContent.id) {
        // Update existing
        const { data, error } = await supabase
          .from('daily_content')
          .update(editingContent)
          .eq('id', editingContent.id)
          .select()
          .single()

        if (error) throw error
        dailyContentId = data.id
        toast.success('Content updated!')
      } else {
        // Create new
        const { data, error } = await supabase
          .from('daily_content')
          .insert(editingContent)
          .select()
          .single()

        if (error) throw error
        dailyContentId = data.id
        toast.success('Content created!')
      }

      // Save profile contents
      if (dailyContentId) {
        // Get existing profile contents for this day
        const existingProfileContents = profileContents.filter(
          pc => pc.daily_content_id === dailyContentId
        )

        for (const [profileType, profileContent] of Object.entries(editingProfileContents)) {
          const existing = existingProfileContents.find(
            pc => pc.profile_type === profileType as UserProfileType
          )

          if (profileContent.star_food_name && profileContent.star_food_name.trim()) {
            // Save or update profile content
            const profileData = {
              daily_content_id: dailyContentId,
              profile_type: profileType as UserProfileType,
              star_food_name: profileContent.star_food_name.trim(),
              star_food_description: profileContent.star_food_description || '',
              allowed_foods: profileContent.allowed_foods || [],
            }

            if (existing?.id) {
              // Update existing
              const { error } = await supabase
                .from('profile_content')
                .update(profileData)
                .eq('id', existing.id)
              if (error) throw error
            } else {
              // Create new
              const { error } = await supabase
                .from('profile_content')
                .insert(profileData)
              if (error) throw error
            }
          } else if (existing?.id) {
            // Delete if star_food_name is cleared
            const { error } = await supabase
              .from('profile_content')
              .delete()
              .eq('id', existing.id)
            if (error) throw error
          }
        }
      }

      setEditingContent(null)
      setEditingProfileContents({} as Record<UserProfileType, Partial<ProfileContent>>)
      await loadContent()
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    }
  }

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const { error } = await supabase
        .from('daily_content')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Content deleted!')
      await loadContent()
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  const handleSaveBonus = async () => {
    if (!editingBonus) return

    try {
      if (editingBonus.id) {
        // Update existing
        const { error } = await supabase
          .from('bonus_content')
          .update(editingBonus)
          .eq('id', editingBonus.id)

        if (error) throw error
        toast.success('Bonus content updated!')
      } else {
        // Create new
        const { error } = await supabase
          .from('bonus_content')
          .insert(editingBonus)

        if (error) throw error
        toast.success('Bonus content created!')
      }

      setEditingBonus(null)
      await loadContent()
    } catch (error) {
      console.error('Error saving bonus:', error)
      toast.error('Failed to save bonus content')
    }
  }

  const handleDeleteBonus = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bonus?')) return

    try {
      const { error } = await supabase
        .from('bonus_content')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Bonus deleted!')
      await loadContent()
    } catch (error) {
      console.error('Error deleting bonus:', error)
      toast.error('Failed to delete bonus')
    }
  }

  const handleToggleBonusActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('bonus_content')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      toast.success(`Bonus ${!isActive ? 'activated' : 'deactivated'}!`)
      await loadContent()
    } catch (error) {
      console.error('Error toggling bonus:', error)
      toast.error('Failed to update bonus')
    }
  }

  const getProfileContentsForDay = (dailyContentId: string) => {
    return profileContents.filter(pc => pc.daily_content_id === dailyContentId)
  }

  const loadProfileContentsForEditing = (dailyContentId: string) => {
    const contents = getProfileContentsForDay(dailyContentId)
    const profileContentsMap = {} as Record<UserProfileType, Partial<ProfileContent>>
    
    Object.keys(PROFILE_TYPES).forEach((type) => {
      const existing = contents.find(pc => pc.profile_type === type)
      profileContentsMap[type as UserProfileType] = existing || {
        daily_content_id: dailyContentId,
        profile_type: type as UserProfileType,
        star_food_name: '',
        star_food_description: '',
        allowed_foods: [],
      }
    })
    
    setEditingProfileContents(profileContentsMap)
  }

  const filteredDailyContents = selectedProfileType === 'all'
    ? dailyContents
    : dailyContents.filter(dc => {
        const dayProfileContents = getProfileContentsForDay(dc.id)
        return dayProfileContents.some(pc => pc.profile_type === selectedProfileType)
      })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage daily content and bonus rewards</p>
            </div>
            {activeTab === 'content' ? (
              <Button
                onClick={() => {
                  setEditingContent({ day_number: dailyContents.length + 1, lean_message: '', micro_challenge: '' })
                  setEditingProfileContents({} as Record<UserProfileType, Partial<ProfileContent>>)
                }}
              >
                <Plus className="w-5 h-5" />
                Add New Day
              </Button>
            ) : (
              <Button
                onClick={() => setEditingBonus({ title: '', content_type: '', unlock_points: 40, is_active: true })}
              >
                <Plus className="w-5 h-5" />
                Add Bonus Content
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'content'
                  ? 'text-primary-500 border-b-2 border-primary-500 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Daily Content
            </button>
            <button
              onClick={() => setActiveTab('bonuses')}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'bonuses'
                  ? 'text-primary-500 border-b-2 border-primary-500 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gift className="w-5 h-5" />
              Bonus Rewards
            </button>
          </div>
        </div>

        {activeTab === 'content' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Content List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>30-Day Content</CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={selectedProfileType}
                        onChange={(e) => setSelectedProfileType(e.target.value as UserProfileType | 'all')}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Types</option>
                        {Object.entries(PROFILE_TYPES).map(([key, info]) => (
                          <option key={key} value={key}>
                            {info.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredDailyContents.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        {selectedProfileType === 'all'
                          ? 'No content yet. Create your first day!'
                          : `No content found for ${PROFILE_TYPES[selectedProfileType as UserProfileType]?.name || selectedProfileType}`}
                      </p>
                    ) : (
                      filteredDailyContents.map((content) => {
                        const dayProfileContents = getProfileContentsForDay(content.id)
                        const profileTypes = dayProfileContents.map(pc => pc.profile_type)
                        
                        return (
                          <div
                            key={content.id}
                            className="p-3 rounded-lg border-2 hover:border-primary-500 cursor-pointer transition-colors"
                            onClick={() => setSelectedDay(content.day_number)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Day {content.day_number}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingContent(content)
                                    loadProfileContentsForEditing(content.id)
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Edit className="w-4 h-4 text-primary-500" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteContent(content.id)
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {content.lean_message}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {profileTypes.length > 0 ? (
                                profileTypes.map((type) => {
                                  const profileInfo = PROFILE_TYPES[type]
                                  return (
                                    <span
                                      key={type}
                                      className="text-xs px-2 py-0.5 rounded"
                                      style={{
                                        backgroundColor: `${profileInfo.color}20`,
                                        color: profileInfo.color,
                                      }}
                                    >
                                      {profileInfo.icon} {profileInfo.name.split(' ')[0]}
                                    </span>
                                  )
                                })
                              ) : (
                                <span className="text-xs text-gray-400 italic">No profile types defined</span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Editor */}
            <div className="lg:col-span-2">
              {editingContent ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {editingContent.id ? 'Edit' : 'Create'} Day {editingContent.day_number}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveContent}>
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setEditingContent(null)
                          setEditingProfileContents({} as Record<UserProfileType, Partial<ProfileContent>>)
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="number"
                      label="Day Number"
                      value={editingContent.day_number || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          day_number: Number(e.target.value),
                        })
                      }
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lean&apos;s Message
                      </label>
                      <textarea
                        value={editingContent.lean_message || ''}
                        onChange={(e) =>
                          setEditingContent({
                            ...editingContent,
                            lean_message: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Micro-Challenge
                      </label>
                      <textarea
                        value={editingContent.micro_challenge || ''}
                        onChange={(e) =>
                          setEditingContent({
                            ...editingContent,
                            micro_challenge: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>

                    <Input
                      label="Panic Button Audio URL"
                      value={editingContent.panic_button_audio_url || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          panic_button_audio_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Panic Button Support Text
                      </label>
                      <textarea
                        value={editingContent.panic_button_text || ''}
                        onChange={(e) =>
                          setEditingContent({
                            ...editingContent,
                            panic_button_text: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile-Specific Content</h3>
                      <div className="space-y-4">
                        {Object.entries(PROFILE_TYPES).map(([typeKey, typeInfo]) => {
                          const profileContent = editingProfileContents[typeKey as UserProfileType] || {
                            daily_content_id: editingContent?.id || '',
                            profile_type: typeKey as UserProfileType,
                            star_food_name: '',
                            star_food_description: '',
                            allowed_foods: [],
                          }

                          return (
                            <div
                              key={typeKey}
                              className="border-2 border-gray-200 rounded-lg p-4"
                              style={{ borderColor: `${typeInfo.color}40` }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{typeInfo.icon}</span>
                                <h4 className="font-semibold text-gray-900">{typeInfo.name}</h4>
                              </div>
                              
                              <div className="space-y-3">
                                <Input
                                  label="Star Food Name"
                                  value={profileContent.star_food_name || ''}
                                  onChange={(e) => {
                                    setEditingProfileContents({
                                      ...editingProfileContents,
                                      [typeKey]: {
                                        ...profileContent,
                                        star_food_name: e.target.value,
                                      },
                                    })
                                  }}
                                  placeholder="e.g., Green Tea"
                                />

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Star Food Description
                                  </label>
                                  <textarea
                                    value={profileContent.star_food_description || ''}
                                    onChange={(e) => {
                                      setEditingProfileContents({
                                        ...editingProfileContents,
                                        [typeKey]: {
                                          ...profileContent,
                                          star_food_description: e.target.value,
                                        },
                                      })
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                                    rows={2}
                                    placeholder="Describe the benefits of this food..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Allowed Foods (comma-separated)
                                  </label>
                                  <textarea
                                    value={Array.isArray(profileContent.allowed_foods) 
                                      ? profileContent.allowed_foods.join(', ')
                                      : typeof profileContent.allowed_foods === 'string'
                                      ? profileContent.allowed_foods
                                      : ''}
                                    onChange={(e) => {
                                      const foods = e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                      setEditingProfileContents({
                                        ...editingProfileContents,
                                        [typeKey]: {
                                          ...profileContent,
                                          allowed_foods: foods,
                                        },
                                      })
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                                    rows={2}
                                    placeholder="Green Tea, Lean Protein, Chili Peppers..."
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="bg-primary-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 Define profile-specific nutrition content for each type. All profile types are optional, 
                        but it&apos;s recommended to fill them for a complete experience.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <p>Select a day to edit or create a new day</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Bonus Content Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bonus List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Bonus Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bonusContents.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No bonus content yet. Create your first bonus!
                      </p>
                    ) : (
                      bonusContents.map((bonus) => (
                        <div
                          key={bonus.id}
                          className={`p-3 rounded-lg border-2 hover:border-primary-500 cursor-pointer transition-colors ${
                            !bonus.is_active ? 'opacity-50 bg-gray-50' : ''
                          }`}
                          onClick={() => setEditingBonus(bonus)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{bonus.title}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleBonusActive(bonus.id, bonus.is_active)
                                }}
                                className={`px-2 py-1 text-xs rounded ${
                                  bonus.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {bonus.is_active ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteBonus(bonus.id)
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                              {bonus.unlock_points} pts
                            </span>
                            <span className="text-gray-500">{bonus.content_type}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bonus Editor */}
            <div className="lg:col-span-2">
              {editingBonus ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {editingBonus.id ? 'Edit' : 'Create'} Bonus Content
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveBonus}>
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingBonus(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="Bonus Title"
                      value={editingBonus.title || ''}
                      onChange={(e) =>
                        setEditingBonus({
                          ...editingBonus,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Exclusive Recipe Book"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingBonus.description || ''}
                        onChange={(e) =>
                          setEditingBonus({
                            ...editingBonus,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                        rows={3}
                        placeholder="Describe what users will receive..."
                      />
                    </div>

                    <Input
                      label="Content Type"
                      value={editingBonus.content_type || ''}
                      onChange={(e) =>
                        setEditingBonus({
                          ...editingBonus,
                          content_type: e.target.value,
                        })
                      }
                      placeholder="e.g., PDF, Video, Article, Recipe"
                    />

                    <Input
                      label="Content URL"
                      value={editingBonus.content_url || ''}
                      onChange={(e) =>
                        setEditingBonus({
                          ...editingBonus,
                          content_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />

                    <Input
                      type="number"
                      label="Unlock Points Required"
                      value={editingBonus.unlock_points || 40}
                      onChange={(e) =>
                        setEditingBonus({
                          ...editingBonus,
                          unlock_points: Number(e.target.value),
                        })
                      }
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={editingBonus.is_active !== false}
                        onChange={(e) =>
                          setEditingBonus({
                            ...editingBonus,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-500"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active (visible to users when unlocked)
                      </label>
                    </div>

                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        🎁 <strong>Tip:</strong> Users will automatically unlock this bonus when they reach 
                        the specified point threshold. Make sure the content URL is publicly accessible!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <p>Select a bonus to edit or create a new one</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

