import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AppLayout } from '@/components/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { ChatPage } from '@/pages/ChatPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { GoalSetupPage } from '@/pages/GoalSetupPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Private routes */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Private routes without bottom navigation */}
      <Route
        element={
          <PrivateRoute>
            <Outlet />
          </PrivateRoute>
        }
      >
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/goal-setup" element={<GoalSetupPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  )
}
