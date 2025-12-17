'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DailyContent, DailyTask, ProfileContent } from '@/lib/types'
import { PROFILE_TYPES } from '@/lib/constants'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Save } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [dailyContents, setDailyContents] = useState<DailyContent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState<Partial<DailyContent> | null>(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_content')
        .select('*')
        .order('day_number')

      if (error) throw error
      setDailyContents(data || [])
    } catch (error) {
      console.error('Error loading content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContent = async () => {
    if (!editingContent) return

    try {
      if (editingContent.id) {
        // Update existing
        const { error } = await supabase
          .from('daily_content')
          .update(editingContent)
          .eq('id', editingContent.id)

        if (error) throw error
        toast.success('Content updated!')
      } else {
        // Create new
        const { error } = await supabase
          .from('daily_content')
          .insert(editingContent)

        if (error) throw error
        toast.success('Content created!')
      }

      setEditingContent(null)
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage daily content and tasks</p>
          </div>
          <Button
            onClick={() => setEditingContent({ day_number: dailyContents.length + 1, lean_message: '', micro_challenge: '' })}
          >
            <Plus className="w-5 h-5" />
            Add New Day
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>30-Day Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dailyContents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No content yet. Create your first day!
                    </p>
                  ) : (
                    dailyContents.map((content) => (
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
                      </div>
                    ))
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
                      <Button variant="outline" onClick={() => setEditingContent(null)}>
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
                      Lean's Message
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

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      💡 After saving this content, you can add tasks and profile-specific 
                      nutrition data from the detailed view.
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
      </div>
    </div>
  )
}

