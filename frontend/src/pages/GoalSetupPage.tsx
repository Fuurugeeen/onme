import { useNavigate } from 'react-router-dom'

export function GoalSetupPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-4">
      <h1 className="text-2xl font-bold">目標設定</h1>
      <p className="mt-2 text-muted-foreground">目標設定画面（実装予定）</p>
      <button
        onClick={() => navigate('/')}
        className="mt-8 text-muted-foreground hover:text-foreground"
      >
        ホームへ戻る
      </button>
    </div>
  )
}
