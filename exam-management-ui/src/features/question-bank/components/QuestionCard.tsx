import { Card } from '@/components/ui/card'

import type { Question } from '../types/question.types'

import { DifficultyBadge } from './DifficultyBadge'
import { QuestionStatusBadge } from './QuestionStatusBadge'

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({
  question,
}: QuestionCardProps) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium">
          {question.content}
        </h3>

        <QuestionStatusBadge
          status={question.status}
        />
      </div>

      <div className="flex items-center gap-2">
        <DifficultyBadge
          difficulty={question.difficulty}
        />

        <span className="text-sm text-[var(--text-muted)]">
          {question.subject}
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        {question.createdAt}
      </p>
    </Card>
  )
}