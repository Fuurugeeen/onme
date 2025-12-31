import { useNavigate } from 'react-router-dom'
import { GoalCard } from '@/components/home/GoalCard'
import { StreakBadge } from '@/components/home/StreakBadge'
import { CoachingCTA } from '@/components/home/CoachingCTA'
import { InsightsList } from '@/components/home/InsightsList'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// TODO: APIから取得するように変更
const mockGoal: {
  title: string
  progress: number
  daysRemaining: number
} | null = {
  title: 'TOEIC 800点',
  progress: 65,
  daysRemaining: 42,
}

const mockStreakDays = 12

const mockInsights = [
  { id: '1', text: '朝の時間が集中できる' },
  { id: '2', text: '週末まとめは続かない' },
]

function GoalSetupPrompt() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold">目標を設定しよう</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          目標を設定すると、コーチングがより効果的になります
        </p>
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={() => navigate('/goal-setup')}
        >
          目標を設定する
        </Button>
      </CardContent>
    </Card>
  )
}

export function HomePage() {
  return (
    <div className="space-y-6 p-4">
      {mockGoal ? (
        <GoalCard
          title={mockGoal.title}
          progress={mockGoal.progress}
          daysRemaining={mockGoal.daysRemaining}
        />
      ) : (
        <GoalSetupPrompt />
      )}

      <StreakBadge days={mockStreakDays} />

      <CoachingCTA />

      <InsightsList insights={mockInsights} />
    </div>
  )
}
