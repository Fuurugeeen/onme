import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Message, Conversation } from '@/types'

interface SendMessageParams {
  conversationId?: string | null
  type: 'onboarding' | 'daily' | 'reflection'
  message: string
}

interface SendMessageResponse {
  conversation_id: string
  message: Message
}

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ conversationId, type, message }: SendMessageParams) => {
      const { data } = await api.post<SendMessageResponse>('/conversation/message', {
        conversation_id: conversationId,
        type,
        message,
      })
      return data
    },
  })
}

export const useStartConversation = () => {
  return useMutation({
    mutationFn: async (type: 'onboarding' | 'daily' | 'reflection') => {
      const { data } = await api.post<Conversation>('/conversation/start', { type })
      return data
    },
  })
}

export const useEndConversation = () => {
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data } = await api.post<Conversation>(`/conversation/${conversationId}/end`)
      return data
    },
  })
}
