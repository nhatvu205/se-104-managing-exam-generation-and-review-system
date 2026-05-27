import React from 'react'
import type { QuestionFormValues } from '../../schemas/question-form.schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QuestionPreviewPanelProps {
  values: Partial<QuestionFormValues>
}

export const QuestionPreviewPanel: React.FC<QuestionPreviewPanelProps> = ({ values }) => {
  const { content, subject, difficulty, learningOutcome, answers } = values

  return (
    <Card className="p-5 flex flex-col gap-4 border-dashed border-2 border-[var(--border-primary)] bg-[var(--surface-secondary)]/30">
      <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3">
        Xem trước câu hỏi (Học sinh)
      </h3>

      <div className="flex flex-wrap gap-2">
        {subject && <Badge variant="info">{subject}</Badge>}
        {difficulty && (
          <Badge
            variant={
              difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'danger'
            }
          >
            Độ khó: {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}
          </Badge>
        )}
        {learningOutcome && <Badge variant="neutral">CĐR: {learningOutcome}</Badge>}
      </div>

      <div className="my-2">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-4 leading-relaxed whitespace-pre-wrap">
          {content || <span className="text-[var(--text-muted)] italic">Nội dung câu hỏi chưa được nhập...</span>}
        </p>

        {answers && answers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {answers.map((answer, index) => (
              <div
                key={answer.id || index}
                className="flex items-center gap-3 p-3 bg-white rounded-[var(--radius-sm)] border border-[var(--border-primary)] shadow-sm"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--text-muted)] text-xs font-semibold bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-sm text-[var(--text-primary)]">
                  {answer.content || <span className="text-[var(--text-muted)] italic">Trống...</span>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">Chưa có câu trả lời...</p>
        )}
      </div>
    </Card>
  )
}
