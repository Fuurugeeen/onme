import { Outlet, NavLink } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation - 2タブ */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex max-w-md justify-around">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-3 text-sm ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Home className="h-6 w-6" />
            <span>ホーム</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-3 text-sm ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Settings className="h-6 w-6" />
            <span>設定</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
