import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ExamMetadata } from '../../types/exam-builder.types'

interface ExamMetadataFormProps {
  metadata: ExamMetadata
  onChange: (updates: Partial<ExamMetadata>) => void
}

export const ExamMetadataForm: React.FC<ExamMetadataFormProps> = ({ metadata, onChange }) => {
  return (
    <Card className="p-6 flex flex-col gap-5 border border-[var(--border-primary)] shadow-sm bg-white">
      <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3">
        Cấu hình thông tin đề thi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="exam-title" className="text-sm font-medium text-[var(--text-secondary)]">
            Tiêu đề đề thi
          </label>
          <Input
            id="exam-title"
            placeholder="Ví dụ: Đề thi học kỳ I môn Lập trình Web..."
            value={metadata.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="exam-desc" className="text-sm font-medium text-[var(--text-secondary)]">
            Mô tả bổ sung (nếu có)
          </label>
          <Textarea
            id="exam-desc"
            placeholder="Nhập mô tả hoặc hướng dẫn làm bài..."
            rows={3}
            value={metadata.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-subject" className="text-sm font-medium text-[var(--text-secondary)]">
            Môn học
          </label>
          <Select
            id="exam-subject"
            value={metadata.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
          >
            <option value="">-- Chọn môn học --</option>
            <option value="Lập trình Web">Lập trình Web</option>
            <option value="Cơ sở dữ liệu">Cơ sở dữ liệu</option>
            <option value="Frontend nâng cao">Frontend nâng cao</option>
            <option value="Backend">Backend</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-duration" className="text-sm font-medium text-[var(--text-secondary)]">
            Thời lượng (phút)
          </label>
          <Input
            id="exam-duration"
            type="number"
            min={1}
            value={metadata.duration}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-year" className="text-sm font-medium text-[var(--text-secondary)]">
            Niên khóa
          </label>
          <Select
            id="exam-year"
            value={metadata.academicYear}
            onChange={(e) => onChange({ academicYear: e.target.value })}
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-semester" className="text-sm font-medium text-[var(--text-secondary)]">
            Học kỳ
          </label>
          <Select
            id="exam-semester"
            value={metadata.semester}
            onChange={(e) => onChange({ semester: e.target.value })}
          >
            <option value="Học kỳ I">Học kỳ I</option>
            <option value="Học kỳ II">Học kỳ II</option>
            <option value="Học kỳ phụ">Học kỳ phụ</option>
          </Select>
        </div>
      </div>
    </Card>
  )
}
export default ExamMetadataForm
