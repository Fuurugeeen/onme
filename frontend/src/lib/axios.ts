import axios from 'axios'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  if (MOCK_MODE) {
    // In mock mode, use a simple mock token
    config.headers.Authorization = 'Bearer mock-user-001'
  } else {
    // In production, use Firebase auth
    const { auth } = await import('./firebase')
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !MOCK_MODE) {
      // Handle unauthorized
      const { auth } = await import('./firebase')
      auth.signOut()
    }
    return Promise.reject(error)
  }
)

export default api
