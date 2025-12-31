import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function AuthLayout() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (user) {
    return <Navigate to="/daily" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Outlet />
    </div>
  )
}
