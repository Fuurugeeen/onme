import { useNavigate } from 'react-router-dom'

export function GoalSetupPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-4">
      <h1 className="text-2xl font-bold">目標を設定しよう</h1>
      <p className="mt-2 text-muted-foreground">目標設定画面（実装予定）</p>

      <div className="mt-8 space-y-4">
        <button
          onClick={() => navigate('/')}
          className="w-full rounded-lg bg-primary px-4 py-3 text-white"
        >
          始める
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-muted-foreground hover:text-foreground"
        >
          後で設定する
        </button>
      </div>
    </div>
  )
}
