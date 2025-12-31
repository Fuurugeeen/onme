import { create } from 'zustand'
import type { Message } from '@/types'

interface ConversationState {
  messages: Message[]
  isLoading: boolean
  conversationId: string | null
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setConversationId: (id: string | null) => void
  clearMessages: () => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  isLoading: false,
  conversationId: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setConversationId: (conversationId) => set({ conversationId }),
  clearMessages: () => set({ messages: [], conversationId: null }),
}))
