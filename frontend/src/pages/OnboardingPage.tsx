import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { useConversationStore } from '@/stores/conversation'
import { useSendMessage, useStartConversation } from '@/api/conversation'
import { useCompleteOnboarding } from '@/api/profile'
import type { Message } from '@/types'

export function OnboardingPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, conversationId, addMessage, setConversationId, setLoading } =
    useConversationStore()

  const startConversation = useStartConversation()
  const sendMessage = useSendMessage()
  const completeOnboarding = useCompleteOnboarding()

  useEffect(() => {
    // Start onboarding conversation
    if (!conversationId) {
      startConversation.mutate('onboarding', {
        onSuccess: (data) => {
          setConversationId(data.id)
          if (data.messages.length > 0) {
            data.messages.forEach(addMessage)
          }
        },
      })
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    addMessage(userMessage)
    setLoading(true)

    try {
      const response = await sendMessage.mutateAsync({
        conversationId,
        type: 'onboarding',
        message: content,
      })

      addMessage(response.message)

      // Check if onboarding is complete (you can add a flag in the response)
      if (response.message.content.includes('[ONBOARDING_COMPLETE]')) {
        await completeOnboarding.mutateAsync()
        navigate('/daily')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">Onboarding</h1>
        <p className="text-sm text-muted-foreground">AIコーチと自己紹介しよう</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2">
                <p className="text-sm text-muted-foreground">...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-white p-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}
