import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoalForm } from '@/components/goal/GoalForm'
import { useCreateGoal } from '@/api/goals'
import type { GoalCreate } from '@/types'

export function GoalSetupPage() {
  const navigate = useNavigate()
  const createGoal = useCreateGoal()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: GoalCreate) => {
    setError(null)
    try {
      await createGoal.mutateAsync(data)
      navigate('/')
    } catch (err) {
      console.error('Failed to create goal:', err)
      setError('目標の保存に失敗しました。もう一度お試しください。')
    }
  }

  const handleSkip = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">目標設定</h1>
        <p className="text-sm text-muted-foreground">コーチングの目標を設定しましょう</p>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <GoalForm
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          isLoading={createGoal.isPending}
          error={error}
        />
      </main>
    </div>
  )
}
