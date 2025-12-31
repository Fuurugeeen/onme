import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, GoalUpdate } from '@/types'

interface GoalState {
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, update: GoalUpdate) => void
  deleteGoal: (id: string) => void
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, update) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...update, updated_at: new Date().toISOString() } : goal
          ),
        })),
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
