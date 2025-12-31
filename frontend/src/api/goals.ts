import { useMutation } from '@tanstack/react-query'
import { useGoalStore } from '@/stores/goal'
import type { Goal, GoalCreate, GoalUpdate } from '@/types'

// Note: Backend API for goals is not yet implemented
// Using local store with persist middleware for now
// Goals are accessed directly via useGoalStore

const generateId = () => crypto.randomUUID()

export const useCreateGoal = () => {
  const { addGoal } = useGoalStore()

  return useMutation({
    mutationFn: async (data: GoalCreate): Promise<Goal> => {
      const now = new Date().toISOString()
      const goal: Goal = {
        id: generateId(),
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        created_at: now,
        updated_at: now,
      }
      addGoal(goal)
      return goal
    },
  })
}

export const useUpdateGoal = () => {
  const { updateGoal } = useGoalStore()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GoalUpdate }): Promise<Goal> => {
      updateGoal(id, data)
      const { goals } = useGoalStore.getState()
      const updated = goals.find((g) => g.id === id)
      if (!updated) throw new Error('Goal not found')
      return updated
    },
  })
}

export const useDeleteGoal = () => {
  const { deleteGoal } = useGoalStore()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      deleteGoal(id)
    },
  })
}
