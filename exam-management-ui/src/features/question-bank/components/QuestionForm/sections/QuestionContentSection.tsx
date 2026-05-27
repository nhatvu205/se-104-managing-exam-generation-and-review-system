import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { QuestionFormValues } from '../../../schemas/question-form.schema'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

interface QuestionContentSectionProps {
  form: UseFormReturn<QuestionFormValues>
}

export const QuestionContentSection: React.FC<QuestionContentSectionProps> = ({ form }) => {
  const { register, formState: { errors } } = form

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-[var(--border-secondary)] pb-3">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          Nội dung câu hỏi
        </h3>
        <span className="text-xs text-[var(--text-muted)]">Hỗ trợ Markdown cơ bản</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-textarea" className="sr-only">Nội dung câu hỏi</label>
        <Textarea
          id="content-textarea"
          placeholder="Nhập nội dung câu hỏi tại đây..."
          rows={6}
          error={errors.content?.message}
          {...register('content')}
        />
      </div>
    </Card>
  )
}
