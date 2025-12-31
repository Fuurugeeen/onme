import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, GoalUpdate } from '@/types'

interface GoalState {
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, update: GoalUpdate) => Goal | undefined
  deleteGoal: (id: string) => void
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, update) => {
        const goalToUpdate = get().goals.find((goal) => goal.id === id)
        if (!goalToUpdate) {
          return undefined
        }
        const updatedGoal = { ...goalToUpdate, ...update, updated_at: new Date().toISOString() }
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? updatedGoal : goal)),
        }))
        return updatedGoal
      },
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
    }),
    {
      name: 'goal-storage',
    }
  )
)
