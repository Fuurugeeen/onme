import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import type { GoalCreate } from '@/types'

interface GoalFormProps {
  onSubmit: (data: GoalCreate) => void
  onSkip?: () => void
  isLoading?: boolean
  error?: string | null
}

export function GoalForm({ onSubmit, onSkip, isLoading, error }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline || undefined,
    })
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>目標を設定しよう</CardTitle>
        <CardDescription>達成したい目標を設定して、コーチと一緒に進めましょう</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              目標 <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="例：毎日30分運動する"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              詳細（任意）
            </label>
            <Textarea
              id="description"
              placeholder="目標の詳細や達成するための具体的なアクションなど"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              期限（任意）
            </label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" disabled={!title.trim() || isLoading}>
              {isLoading ? '保存中...' : '目標を設定する'}
            </Button>
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip} disabled={isLoading}>
                後で設定する
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
