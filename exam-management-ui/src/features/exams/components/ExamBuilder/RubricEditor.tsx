import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { SelectedQuestion } from '../../types/exam-builder.types'
import { Coins } from 'lucide-react'

interface RubricEditorProps {
  selectedQuestions: SelectedQuestion[]
  onUpdateScore: (questionId: number, score: number) => void
  totalScore: number
}

export const RubricEditor: React.FC<RubricEditorProps> = ({
  selectedQuestions,
  onUpdateScore,
  totalScore,
}) => {
  return (
    <Card className="p-6 flex flex-col gap-4 border border-[var(--border-primary)] shadow-sm bg-white">
      <div className="flex justify-between items-center border-b border-[var(--border-secondary)] pb-3">
        <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Coins className="h-5 w-5 text-[var(--warning)]" />
          Phân bố điểm số (Rubric)
        </h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          totalScore === 10
            ? 'bg-[var(--success-bg)] text-[var(--success)]'
            : 'bg-[var(--danger-bg)] text-[var(--danger)]'
        }`}>
          Tổng điểm: {totalScore} / 10
        </span>
      </div>

      {selectedQuestions.length === 0 ? (
        <div className="text-center py-6 text-sm text-[var(--text-muted)] italic">
          Vui lòng thêm câu hỏi vào đề thi để phân chia điểm số.
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
          {selectedQuestions.map((sq, index) => (
            <div
              key={sq.question.id}
              className="flex items-center justify-between gap-4 p-3 border border-[var(--border-primary)] rounded-[var(--radius-md)] bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  Câu {index + 1}: {sq.question.content}
                </p>
                <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                  Môn: {sq.question.subject} • Độ khó:{' '}
                  {sq.question.difficulty === 'easy' ? 'Dễ' : sq.question.difficulty === 'medium' ? 'TB' : 'Khó'}
                </span>
              </div>

              {/* Point Allocation Input */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor={`point-${sq.question.id}`} className="sr-only">
                  Điểm số câu {index + 1}
                </label>
                <Input
                  id={`point-${sq.question.id}`}
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="10"
                  className="w-20 text-center h-10 font-bold"
                  value={sq.score}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    onUpdateScore(sq.question.id, val)
                  }}
                />
                <span className="text-sm font-medium text-[var(--text-secondary)]">điểm</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
export default RubricEditor
