import React from 'react'
import { ExamListContainer } from '@/features/exams/components/ExamList/ExamListContainer'

export const ExamListPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Quản lý đề thi
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Xây dựng, chỉnh sửa và quản lý các bài kiểm tra, đề thi định kỳ của trường học.
        </p>
      </div>

      <ExamListContainer />
    </div>
  )
}
export default ExamListPage
