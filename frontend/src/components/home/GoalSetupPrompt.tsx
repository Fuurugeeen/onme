import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function GoalSetupPrompt() {
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
        <Button className="mt-4 w-full" variant="outline" onClick={() => navigate('/goal-setup')}>
          目標を設定する
        </Button>
      </CardContent>
    </Card>
  )
}
