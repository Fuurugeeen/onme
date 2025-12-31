import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface ChatLayoutProps {
  children: ReactNode
  title?: string
}

export function ChatLayout({ children, title = 'コーチング' }: ChatLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex shrink-0 items-center border-b bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          戻る
        </button>
        <h1 className="ml-4 text-lg font-semibold">{title}</h1>
      </header>

      {/* Content */}
      {children}
    </div>
  )
}
