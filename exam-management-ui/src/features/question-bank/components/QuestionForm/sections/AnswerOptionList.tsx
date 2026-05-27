import React from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { QuestionFormValues } from '../../../schemas/question-form.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, Plus, CheckCircle } from 'lucide-react'

interface AnswerOptionListProps {
  register: UseFormRegister<QuestionFormValues>
  fields: any[]
  errors: FieldErrors<QuestionFormValues>
  handleAddAnswer: () => void
  handleRemoveAnswer: (index: number) => void
  handleSetCorrectAnswer: (index: number) => void
}

export const AnswerOptionList: React.FC<AnswerOptionListProps> = ({
  register,
  fields,
  errors,
  handleAddAnswer,
  handleRemoveAnswer,
  handleSetCorrectAnswer,
}) => {
  return (
    <Card className="p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-[var(--border-secondary)] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Danh sách đáp án
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Nhập nội dung các đáp án và tích chọn đáp án đúng nhất
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddAnswer}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Thêm đáp án
        </Button>
      </div>

      {errors.answers?.root?.message && (
        <div className="p-3 text-sm text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger-bg)] rounded-[var(--radius-md)]">
          {errors.answers.root.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const isCorrect = field.isCorrect
          const err = errors.answers?.[index]?.content?.message

          return (
            <div
              key={field.id}
              className={`flex items-start gap-4 p-4 rounded-[var(--radius-md)] border transition-all duration-200 ${
                isCorrect
                  ? 'border-[var(--success)] bg-[var(--success-bg)]/20'
                  : 'border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {/* Correct Radio-like Pick */}
              <button
                type="button"
                onClick={() => handleSetCorrectAnswer(index)}
                className={`mt-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
                  isCorrect
                    ? 'border-[var(--success)] bg-[var(--success)] text-white'
                    : 'border-[var(--text-muted)] bg-white text-transparent hover:border-[var(--accent-primary)]'
                }`}
                aria-label={`Đặt đáp án ${index + 1} là đúng`}
              >
                <CheckCircle className="h-4 w-4" />
              </button>

              <div className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Đáp án {String.fromCharCode(65 + index)}
                </span>
                <Input
                  placeholder={`Nhập nội dung đáp án ${String.fromCharCode(65 + index)}...`}
                  error={err}
                  {...register(`answers.${index}.content` as const)}
                />
              </div>

              {/* Remove Answer Button */}
              {fields.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAnswer(index)}
                  className="mt-7 text-[var(--text-muted)] hover:text-[var(--danger)] p-1.5 rounded-full hover:bg-[var(--danger-bg)] transition-all duration-200"
                  aria-label={`Xóa đáp án ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
