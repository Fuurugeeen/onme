import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { signInWithGoogle } from '@/api/auth'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/daily')
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">OnMe</CardTitle>
          <CardDescription>
            SNSから離れて、自分と向き合う時間を作ろう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>AIコーチと一緒に、</p>
            <p>自分の強み・特性を発見しよう</p>
          </div>
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Loading...' : import.meta.env.VITE_MOCK_MODE === 'true' ? 'ログイン（Mock）' : 'Googleでログイン'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
