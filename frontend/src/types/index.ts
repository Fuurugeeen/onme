// User Profile Types
export interface ThinkingStyle {
  logical_intuitive: number       // 0=直感的 〜 1=論理的
  decisive_deliberate: number     // 0=即決型 〜 1=熟考型
  optimistic_cautious: number     // 0=楽観的 〜 1=慎重派
}

export interface MotivationDrivers {
  achievement: number    // 達成感
  recognition: number    // 承認
  growth: number         // 成長
  stability: number      // 安定
}

export interface StressResponse {
  pattern: 'avoidant' | 'confronting' | 'seeking_help'
  triggers: string[]
  coping: string[]
}

export interface BehavioralPatterns {
  best_time: 'morning' | 'afternoon' | 'evening' | 'night'
  task_preference: 'small' | 'medium' | 'large'
  streak_sensitivity: 'low' | 'medium' | 'high'
}

export interface ConversationInsight {
  date: string
  insight: string
  context: string
}

export interface UserProfile {
  id: string
  thinking_style: ThinkingStyle
  motivation_drivers: MotivationDrivers
  stress_response: StressResponse
  behavioral_patterns: BehavioralPatterns
  values: string[]
  strengths_discovered: string[]
  growth_areas: string[]
  conversation_insights: ConversationInsight[]
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// Daily Task Types
export type TaskCategory = 'study' | 'lifestyle' | 'exercise' | 'self_exploration'

export interface DailyTask {
  id: string
  user_id: string
  content: string
  category: TaskCategory
  date: string
  completed: boolean
  perceived_load: number | null  // 1-5
  completed_at: string | null
  created_at: string
}

// Conversation Types
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  type: 'onboarding' | 'daily' | 'reflection'
  messages: Message[]
  created_at: string
  ended_at: string | null
}

// Action Log Types
export interface ActionLog {
  id: string
  user_id: string
  task_id: string
  executed: boolean
  perceived_load: number  // 1-5
  logged_at: string
}

// Progress Stats Types
export interface ProgressStats {
  streak_days: number
  total_completed: number
  completion_rate: number
  weekly_stats: {
    date: string
    completed: number
    total: number
  }[]
}

// Goal Types
export interface Goal {
  id: string
  title: string
  description?: string
  deadline?: string
  created_at: string
  updated_at: string
}

export interface GoalCreate {
  title: string
  description?: string
  deadline?: string
}

export interface GoalUpdate {
  title?: string
  description?: string
  deadline?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  detail: string
}
