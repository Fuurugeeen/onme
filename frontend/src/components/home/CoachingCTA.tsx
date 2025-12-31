import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface CoachingCTAProps {
  message?: string
}

export function CoachingCTA({
  message = '昨日の振り返りをしましょう',
}: CoachingCTAProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold">今日のコーチング</h3>
        </div>
        <p className="mt-3 text-muted-foreground">「{message}」</p>
        <Button className="mt-4 w-full" onClick={() => navigate('/chat')}>
          話す →
        </Button>
      </CardContent>
    </Card>
  )
}
