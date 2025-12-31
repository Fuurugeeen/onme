import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function ChatPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center border-b bg-white px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          戻る
        </button>
        <h1 className="ml-4 text-lg font-semibold">チャット</h1>
      </header>
      <main className="flex-1 p-4">
        <p className="text-muted-foreground">チャット画面（実装予定）</p>
      </main>
    </div>
  )
}
