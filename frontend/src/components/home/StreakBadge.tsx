interface StreakBadgeProps {
  days: number
}

export function StreakBadge({ days }: StreakBadgeProps) {
  if (days <= 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-lg font-medium">
      <span className="text-orange-500">🔥</span>
      <span>継続 {days}日目</span>
    </div>
  )
}
