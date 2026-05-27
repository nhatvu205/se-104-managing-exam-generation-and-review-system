import React from 'react'
import type { FieldErrors } from 'react-hook-form'
import type { QuestionFormValues } from '../../schemas/question-form.schema'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface ValidationPanelProps {
  errors: FieldErrors<QuestionFormValues>
  touchedFields: Record<string, any>
  values: Partial<QuestionFormValues>
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  errors,
  values,
}) => {
  // Simple validation checks to render checklist in real-time
  const metadataValid = !!values.subject && !!values.difficulty && !!values.learningOutcome
  const contentValid = !!values.content && values.content.length >= 10
  const answersCountValid = !!values.answers && values.answers.length >= 2
  const correctOptionSelected = !!values.answers && values.answers.some((a) => a.isCorrect)

  const items = [
    { label: 'Chọn đầy đủ thông tin chung (Môn học, Chuẩn đầu ra, v.v.)', valid: metadataValid },
    { label: 'Nội dung câu hỏi tối thiểu 10 ký tự', valid: contentValid },
    { label: 'Có ít nhất 2 đáp án lựa chọn', valid: answersCountValid },
    { label: 'Chọn chính xác 1 đáp án làm đáp án đúng', valid: correctOptionSelected },
  ]

  const totalErrors = Object.keys(errors).length

  return (
    <Card className="p-5 flex flex-col gap-4">
      <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3 flex items-center justify-between">
        <span>Bảng kiểm tra tính hợp lệ</span>
        {totalErrors > 0 ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--danger-bg)] text-[var(--danger)]">
            {totalErrors} lỗi
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)]">
            Hợp lệ
          </span>
        )}
      </h3>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2.5 items-start text-sm">
            {item.valid ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
            )}
            <span className={item.valid ? 'text-[var(--text-secondary)] line-through opacity-70' : 'text-[var(--text-primary)] font-medium'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
