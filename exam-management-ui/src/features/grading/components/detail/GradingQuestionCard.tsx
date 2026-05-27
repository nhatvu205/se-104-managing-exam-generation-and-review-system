import React from 'react'
import { Card } from '@/components/ui/card'
import type { StudentAnswer } from '../../types/grading.types'
import { RubricSection } from './RubricSection'
import { ScoreInput } from './ScoreInput'
import { CommentBox } from './CommentBox'

interface GradingQuestionCardProps {
  answer: StudentAnswer
  index: number
  questionContent: string
  onChangeScore: (score: number) => void
  onChangeFeedback: (feedback: string) => void
}

export const GradingQuestionCard: React.FC<GradingQuestionCardProps> = ({
  answer,
  index,
  questionContent,
  onChangeScore,
  onChangeFeedback,
}) => {
  return (
    <Card className="p-5 flex flex-col gap-4 border border-[var(--border-primary)] bg-white rounded-[var(--radius-lg)] shadow-sm">
      {/* Original Question */}
      <div className="flex flex-col gap-1.5 border-b border-[var(--border-secondary)] pb-3">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">
          Câu {index + 1}: <span className="font-normal text-[var(--text-secondary)]">{questionContent}</span>
        </h4>
      </div>

      {/* Student's Answer */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Bài làm của học sinh:</span>
        <div className="bg-[var(--surface-secondary)]/50 p-4 rounded-[var(--radius-md)] border border-[var(--border-secondary)] text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-mono">
          {answer.studentAnswer || 'Học sinh không điền câu trả lời.'}
        </div>
      </div>

      {/* Rubric Details */}
      <RubricSection />

      {/* Inputs (Score & Feedbacks) */}
      <div className="flex flex-col sm:flex-row gap-4 border-t border-[var(--border-secondary)] pt-4 mt-1">
        <ScoreInput
          value={answer.score}
          maxScore={answer.maxScore}
          onChange={onChangeScore}
        />
        <CommentBox
          value={answer.feedback || ''}
          onChange={onChangeFeedback}
        />
      </div>
    </Card>
  )
}
export default GradingQuestionCard
