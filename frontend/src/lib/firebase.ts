import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null

export const initMessaging = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app)
    return messaging
  }
  return null
}

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted' && messaging) {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      })
      return token
    }
    return null
  } catch (error) {
    console.error('Notification permission error:', error)
    return null
  }
}

export const onMessageListener = () => {
  if (!messaging) return Promise.resolve(null)

  return new Promise((resolve) => {
    onMessage(messaging!, (payload) => {
      resolve(payload)
    })
  })
}
