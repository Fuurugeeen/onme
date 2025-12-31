import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

export const signInWithGoogle = async () => {
  if (MOCK_MODE) {
    // In mock mode, just sync with backend and return mock user
    await api.post('/api/auth/sync')
    const mockUser = {
      uid: 'mock-user-001',
      email: 'mock@example.com',
      displayName: 'Mock User',
      getIdToken: async () => 'mock-user-001',
    }
    useAuthStore.getState().setUser(mockUser)
    return mockUser
  }

  // In production, use Firebase auth
  const { signInWithPopup } = await import('firebase/auth')
  const { auth, googleProvider } = await import('@/lib/firebase')
  const result = await signInWithPopup(auth, googleProvider)
  // Sync user with backend
  await api.post('/api/auth/sync')
  return result.user
}

export const signOut = async () => {
  if (MOCK_MODE) {
    // In mock mode, just clear the user state
    useAuthStore.getState().setUser(null)
    return
  }

  // In production, sign out from Firebase
  const { signOut: firebaseSignOut } = await import('firebase/auth')
  const { auth } = await import('@/lib/firebase')
  await firebaseSignOut(auth)
}
