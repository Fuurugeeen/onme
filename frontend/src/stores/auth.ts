import { create } from 'zustand'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

// Mock user type that matches Firebase User interface (partial)
interface MockUser {
  uid: string
  email: string | null
  displayName: string | null
  getIdToken: () => Promise<string>
}

type UserType = MockUser | import('firebase/auth').User | null

interface AuthState {
  user: UserType
  loading: boolean
  initialized: boolean
  setUser: (user: UserType) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user, loading: false, initialized: true }),
  setLoading: (loading) => set({ loading }),
}))

// Initialize auth state
if (MOCK_MODE) {
  // In mock mode, create a mock user immediately
  const mockUser: MockUser = {
    uid: 'mock-user-001',
    email: 'mock@example.com',
    displayName: 'Mock User',
    getIdToken: async () => 'mock-user-001',
  }
  useAuthStore.getState().setUser(mockUser)
} else {
  // In production, use Firebase auth listener
  import('firebase/auth').then(({ onAuthStateChanged }) => {
    import('@/lib/firebase').then(({ auth }) => {
      onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().setUser(user)
      })
    })
  })
}
