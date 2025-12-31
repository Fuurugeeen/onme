import { useEffect, useRef, useState } from 'react'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useConversationStore } from '@/stores/conversation'
import { useSendMessage, useStartConversation } from '@/api/conversation'
import { useTodayTask, useCompleteTask } from '@/api/tasks'
import type { Message } from '@/types'

export function DailyCoachPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showTaskComplete, setShowTaskComplete] = useState(false)
  const [perceivedLoad, setPerceivedLoad] = useState<number | null>(null)

  const { messages, isLoading, conversationId, addMessage, setConversationId, setLoading, clearMessages } =
    useConversationStore()

  const startConversation = useStartConversation()
  const sendMessage = useSendMessage()
  const { data: todayTask } = useTodayTask()
  const completeTask = useCompleteTask()

  useEffect(() => {
    // Clear previous messages and start daily conversation
    clearMessages()
    startConversation.mutate('daily', {
      onSuccess: (data) => {
        setConversationId(data.id)
        if (data.messages.length > 0) {
          data.messages.forEach(addMessage)
        }
      },
    })
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
        type: 'daily',
        message: content,
      })
      addMessage(response.message)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!todayTask || perceivedLoad === null) return

    try {
      await completeTask.mutateAsync({
        taskId: todayTask.id,
        perceivedLoad,
      })
      setShowTaskComplete(false)
      setPerceivedLoad(null)
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">Daily Coach</h1>
        <p className="text-sm text-muted-foreground">1 day, 1 task</p>
      </header>

      {/* Today's Task Card */}
      {todayTask && !todayTask.completed && (
        <div className="border-b bg-white p-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Today's Task</p>
              <p className="mt-1 font-medium">{todayTask.content}</p>
              {!showTaskComplete ? (
                <Button
                  onClick={() => setShowTaskComplete(true)}
                  className="mt-3 w-full"
                  size="sm"
                >
                  Complete
                </Button>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-sm">How hard was it?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((load) => (
                      <Button
                        key={load}
                        variant={perceivedLoad === load ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPerceivedLoad(load)}
                      >
                        {load}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={handleCompleteTask}
                    disabled={perceivedLoad === null}
                    className="w-full"
                    size="sm"
                  >
                    Done
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
