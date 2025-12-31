import { GoalCard } from '@/components/home/GoalCard'
import { StreakBadge } from '@/components/home/StreakBadge'
import { CoachingCTA } from '@/components/home/CoachingCTA'
import { InsightsList } from '@/components/home/InsightsList'
import { GoalSetupPrompt } from '@/components/home/GoalSetupPrompt'
import { useGoalStore } from '@/stores/goal'

// TODO: APIから取得するように変更
const mockStreakDays = 12

const mockInsights = [
  { id: '1', text: '朝の時間が集中できる' },
  { id: '2', text: '週末まとめは続かない' },
]

function calculateDaysRemaining(deadline?: string): number | null {
  if (!deadline) return null
  // Compare dates only (ignore time) to avoid timezone issues
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline + 'T00:00:00')
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 ? diffDays : 0
}

export function HomePage() {
  const { goals } = useGoalStore()
  const currentGoal = goals[0] // 最初の目標を表示
  const daysRemaining = calculateDaysRemaining(currentGoal?.deadline)

  return (
    <div className="space-y-6 p-4">
      {currentGoal ? (
        <GoalCard title={currentGoal.title} daysRemaining={daysRemaining ?? undefined} />
      ) : (
        <GoalSetupPrompt />
      )}

      <StreakBadge days={mockStreakDays} />

      <CoachingCTA />

      <InsightsList insights={mockInsights} />
    </div>
  )
}
