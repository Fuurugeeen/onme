import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useProgressStats } from '@/api/tasks'

export function ProgressPage() {
  const { data: stats, isLoading } = useProgressStats()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Your journey so far</p>
      </header>

      <div className="space-y-4">
        {/* Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.streak_days || 0} days</div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats ? Math.round(stats.completion_rate * 100) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">
              {stats?.total_completed || 0} tasks completed
            </p>
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {stats?.weekly_stats.map((day) => (
                <div key={day.date} className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full ${
                      day.completed > 0 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                  <span className="mt-1 text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('ja-JP', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
