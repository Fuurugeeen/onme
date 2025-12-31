import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useProfile } from '@/api/profile'
import { signOut } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

export function ProfilePage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useProfile()

  const handleSignOut = async () => {
    await signOut()
  }

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
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </header>

      <div className="space-y-4">
        {/* Discovered Strengths */}
        {profile?.strengths_discovered && profile.strengths_discovered.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Discovered Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.strengths_discovered.map((strength) => (
                  <span
                    key={strength}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Values */}
        {profile?.values && profile.values.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth Areas */}
        {profile?.growth_areas && profile.growth_areas.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Growth Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm">
                {profile.growth_areas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recent Insights */}
        {profile?.conversation_insights && profile.conversation_insights.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.conversation_insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="border-l-2 border-primary pl-3">
                    <p className="text-sm">{insight.insight}</p>
                    <p className="text-xs text-muted-foreground">{insight.context}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign Out */}
        <Button onClick={handleSignOut} variant="outline" className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
