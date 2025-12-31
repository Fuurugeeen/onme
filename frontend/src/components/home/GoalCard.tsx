import { Card, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface GoalCardProps {
  title: string
  progress: number
  daysRemaining: number
}

export function GoalCard({ title, progress, daysRemaining }: GoalCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={progress} className="flex-1" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          残り {daysRemaining}日
        </p>
      </CardContent>
    </Card>
  )
}
