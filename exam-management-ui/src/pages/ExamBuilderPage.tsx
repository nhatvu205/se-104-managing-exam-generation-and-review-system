import React from 'react'
import { ExamBuilderLayout } from '@/features/exams/components/ExamBuilder/ExamBuilderLayout'

export const ExamBuilderPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Thiết lập đề kiểm tra
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Lựa chọn câu hỏi từ ngân hàng, cấu hình điểm số chuẩn hóa, và kiểm định chất lượng đề thi thực tế.
        </p>
      </div>

      <ExamBuilderLayout />
    </div>
  )
}
export default ExamBuilderPage
