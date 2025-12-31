import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGoalStore } from '@/stores/goal'
import type { Goal, GoalCreate, GoalUpdate } from '@/types'

// Note: Backend API for goals is not yet implemented
// Using local store with persist middleware for now

const generateId = () => crypto.randomUUID()

export const useGoals = () => {
  const { goals } = useGoalStore()

  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => goals,
    initialData: goals,
  })
}

export const useGoal = (id: string) => {
  const { goals } = useGoalStore()

  return useQuery({
    queryKey: ['goals', id],
    queryFn: async () => goals.find((g) => g.id === id) ?? null,
    initialData: goals.find((g) => g.id === id) ?? null,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()
  const { updateGoal } = useGoalStore()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GoalUpdate }): Promise<Goal> => {
      updateGoal(id, data)
      const { goals } = useGoalStore.getState()
      const updated = goals.find((g) => g.id === id)
      if (!updated) throw new Error('Goal not found')
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()
  const { deleteGoal } = useGoalStore()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      deleteGoal(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
