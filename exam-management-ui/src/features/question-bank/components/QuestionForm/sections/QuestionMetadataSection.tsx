import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { QuestionFormValues } from '../../../schemas/question-form.schema'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface QuestionMetadataSectionProps {
  form: UseFormReturn<QuestionFormValues>
}

export const QuestionMetadataSection: React.FC<QuestionMetadataSectionProps> = ({ form }) => {
  const { register, formState: { errors } } = form

  return (
    <Card className="p-6 flex flex-col gap-5">
      <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3">
        Thông tin chung
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject-select" className="text-sm font-medium text-[var(--text-secondary)]">
            Môn học
          </label>
          <Select
            id="subject-select"
            error={errors.subject?.message}
            {...register('subject')}
          >
            <option value="">-- Chọn môn học --</option>
            <option value="Lập trình Web">Lập trình Web</option>
            <option value="Frontend nâng cao">Frontend nâng cao</option>
            <option value="Backend">Backend</option>
            <option value="Cơ sở dữ liệu">Cơ sở dữ liệu</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="difficulty-select" className="text-sm font-medium text-[var(--text-secondary)]">
            Độ khó
          </label>
          <Select
            id="difficulty-select"
            error={errors.difficulty?.message}
            {...register('difficulty')}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status-select" className="text-sm font-medium text-[var(--text-secondary)]">
            Trạng thái
          </label>
          <Select
            id="status-select"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="draft">Bản nháp (Draft)</option>
            <option value="complete">Hoàn thành (Complete)</option>
            <option value="flagged">Được gắn cờ (Flagged)</option>
            <option value="error">Lỗi (Error)</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lo-input" className="text-sm font-medium text-[var(--text-secondary)]">
            Chuẩn đầu ra (LO)
          </label>
          <Input
            id="lo-input"
            placeholder="Ví dụ: LO1, LO2.1..."
            error={errors.learningOutcome?.message}
            {...register('learningOutcome')}
          />
        </div>
      </div>
    </Card>
  )
}
