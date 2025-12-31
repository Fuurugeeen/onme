import { Card, CardContent } from '@/components/ui/Card'

export interface Insight {
  id: string
  text: string
}

interface InsightsListProps {
  insights: Insight[]
}

export function InsightsList({ insights }: InsightsListProps) {
  if (insights.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-lg">📝</span>
        <h3 className="font-semibold">最近の気づき</h3>
      </div>
      <Card className="mt-2">
        <CardContent className="p-4">
          <ul className="space-y-2">
            {insights.map((insight) => (
              <li key={insight.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span>•</span>
                <span>{insight.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
