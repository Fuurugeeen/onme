import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AppLayout } from '@/components/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { DailyCoachPage } from '@/pages/DailyCoachPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { ProfilePage } from '@/pages/ProfilePage'

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
        <Route path="/" element={<Navigate to="/daily" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/daily" element={<DailyCoachPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
