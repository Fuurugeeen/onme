import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Target, MessageSquare, Lightbulb, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { signOut } from '@/api/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// モックデータ（後でAPIから取得）
const mockConversations = [
  { id: '1', date: '12/30', title: '振り返り' },
  { id: '2', date: '12/29', title: '目標確認' },
  { id: '3', date: '12/28', title: '週間レビュー' },
]

const mockGoal: { title: string } | null = {
  title: 'TOEIC 800点',
}

const mockInsightsCount = 12

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* ヘッダー */}
      <h1 className="text-xl font-bold">設定</h1>

      {/* アカウント */}
      <section>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">アカウント</span>
        </div>
        <Card className="p-4">
          <p className="text-sm">{user?.email || 'メールアドレス未設定'}</p>
        </Card>
      </section>

      {/* 目標を編集 */}
      <section>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">目標を編集</span>
        </div>
        <Link to="/goal-setup">
          <Card className="p-4 flex items-center justify-between hover:bg-accent transition-colors">
            <span className="text-sm">
              {mockGoal?.title || '目標を設定する'}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        </Link>
      </section>

      {/* 過去の会話 */}
      <section>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">過去の会話</span>
        </div>
        <Card className="divide-y">
          {mockConversations.length > 0 ? (
            mockConversations.map((conv) => (
              <button
                type="button"
                key={conv.id}
                className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors text-left"
              >
                <span className="text-sm">
                  {conv.date} {conv.title}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              まだ会話がありません
            </p>
          )}
        </Card>
      </section>

      {/* 気づき一覧 */}
      <section>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">気づき一覧</span>
        </div>
        <button type="button" className="w-full">
          <Card className="p-4 flex items-center justify-between hover:bg-accent transition-colors">
            <span className="text-sm">
              {mockInsightsCount > 0
                ? `${mockInsightsCount}件の気づき`
                : 'まだ気づきがありません'}
            </span>
            {mockInsightsCount > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Card>
        </button>
      </section>

      {/* ログアウト */}
      <section className="pt-4">
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
        </Button>
      </section>
    </div>
  )
}
