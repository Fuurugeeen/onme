import { Outlet, NavLink } from 'react-router-dom'
import { MessageCircle, BarChart2, User } from 'lucide-react'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex max-w-md justify-around">
          <NavLink
            to="/daily"
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-3 text-sm ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <MessageCircle className="h-6 w-6" />
            <span>Today</span>
          </NavLink>
          <NavLink
            to="/progress"
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-3 text-sm ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <BarChart2 className="h-6 w-6" />
            <span>Progress</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-3 text-sm ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <User className="h-6 w-6" />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
