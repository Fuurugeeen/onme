import { useEffect, useRef, useState } from 'react'
import { ChatLayout } from '@/components/layouts/ChatLayout'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { useConversationStore } from '@/stores/conversation'
import { useSendMessage, useStartConversation } from '@/api/conversation'
import type { Message } from '@/types'

export function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initCalledRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const {
    messages,
    isLoading,
    conversationId,
    addMessage,
    setMessages,
    setLoading,
    setConversationId,
  } = useConversationStore()

  const sendMessage = useSendMessage()
  const startConversation = useStartConversation()

  // Start a new conversation on mount if none exists
  useEffect(() => {
    const initConversation = async () => {
      // Check store directly to avoid stale closure
      const currentConversationId = useConversationStore.getState().conversationId
      if (currentConversationId) return

      try {
        setIsInitializing(true)
        setError(null)
        const conversation = await startConversation.mutateAsync('daily')
        setConversationId(conversation.id)
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages)
        }
      } catch {
        setError('会話の開始に失敗しました。')
      } finally {
        setIsInitializing(false)
      }
    }

    if (!initCalledRef.current) {
      initCalledRef.current = true
      initConversation()
    }
  }, [startConversation, setConversationId, setMessages])

  // Retry function for error recovery
  const retryInitConversation = async () => {
    const currentConversationId = useConversationStore.getState().conversationId
    if (currentConversationId) return

    try {
      setIsInitializing(true)
      setError(null)
      const conversation = await startConversation.mutateAsync('daily')
      setConversationId(conversation.id)
      if (conversation.messages && conversation.messages.length > 0) {
        setMessages(conversation.messages)
      }
    } catch {
      setError('会話の開始に失敗しました。')
    } finally {
      setIsInitializing(false)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content: string) => {
    setError(null)

    // Save current messages before optimistic update
    const previousMessages = [...messages]

    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    addMessage(userMessage)
    setLoading(true)

    try {
      const response = await sendMessage.mutateAsync({
        conversationId: conversationId || undefined,
        type: 'daily',
        message: content,
      })

      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      // Add assistant response
      addMessage(response.message)
    } catch {
      // Remove failed message and show error
      setMessages(previousMessages)
      setError('メッセージの送信に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ChatLayout>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
              <p>{error}</p>
              {!conversationId && (
                <button
                  type="button"
                  onClick={retryInitConversation}
                  className="mt-2 text-primary underline hover:no-underline"
                >
                  再試行
                </button>
              )}
            </div>
          )}
          {isInitializing && <p className="text-center text-muted-foreground">読み込み中...</p>}
          {messages.length === 0 && !isLoading && !isInitializing && !error && (
            <p className="text-center text-muted-foreground">
              コーチングを始めましょう。何でも話してください。
            </p>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2">
                <p className="text-sm text-muted-foreground">入力中...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t bg-white p-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            onSend={handleSend}
            disabled={isLoading || isInitializing}
            placeholder="メッセージを入力..."
          />
        </div>
      </div>
    </ChatLayout>
  )
}
