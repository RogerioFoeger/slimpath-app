'use client'

import { useMemo, memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DailyTask } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

interface DailyChecklistProps {
  tasks: DailyTask[]
  completedTaskIds: string[]
  onTaskToggle: (taskId: string, completed: boolean) => void
  slimPoints: number
}

export const DailyChecklist = memo(function DailyChecklist({
  tasks,
  completedTaskIds,
  onTaskToggle,
  slimPoints,
}: DailyChecklistProps) {
  const completedCount = completedTaskIds.length
  const totalCount = tasks.length
  const percentage = useMemo(() => totalCount > 0 ? (completedCount / totalCount) * 100 : 0, [completedCount, totalCount])
  const isComplete = useMemo(() => completedCount === totalCount && totalCount > 0, [completedCount, totalCount])
  
  const sortedTasks = useMemo(() => 
    [...tasks].sort((a, b) => a.task_order - b.task_order),
    [tasks]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Checklist</CardTitle>
          <div className="flex items-center gap-2 bg-gradient-secondary text-white px-3 py-1 rounded-full">
            <span className="text-2xl">⭐</span>
            <span className="font-bold">{slimPoints}</span>
            <span className="text-xs">Slim Points</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ProgressBar
          value={completedCount}
          max={totalCount}
          showLabel
          color={isComplete ? 'success' : 'primary'}
        />

        {isComplete && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-900">
                Congratulations! 🎉
              </p>
              <p className="text-sm text-green-700">
                You&apos;ve earned +1 Slim Point! Keep up the great work!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tasks for today. Check back soon!
            </p>
          ) : (
            sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    label={task.task_text}
                    checked={completedTaskIds.includes(task.id)}
                    onChange={(e) => onTaskToggle(task.id, e.target.checked)}
                  />
                </div>
              ))
          )}
        </div>

        <div className="bg-primary-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> Complete all tasks to earn 1 Slim Point. 
            Reach 40 points to unlock exclusive bonus content!
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

