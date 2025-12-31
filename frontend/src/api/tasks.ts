import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { DailyTask, ProgressStats } from '@/types'

export const useTodayTask = () => {
  return useQuery({
    queryKey: ['task', 'today'],
    queryFn: async () => {
      const { data } = await api.get<DailyTask>('/tasks/today')
      return data
    },
  })
}

export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, perceivedLoad }: { taskId: string; perceivedLoad: number }) => {
      const { data } = await api.post<DailyTask>(`/tasks/${taskId}/complete`, {
        perceived_load: perceivedLoad,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'] })
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}

export const useSkipTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data } = await api.post<DailyTask>(`/tasks/${taskId}/skip`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'] })
    },
  })
}

export const useProgressStats = () => {
  return useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<ProgressStats>('/tasks/progress')
      return data
    },
  })
}
