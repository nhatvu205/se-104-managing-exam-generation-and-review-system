import React from 'react'
import type { Exam } from '../../types/exam.types'
import { Eye } from 'lucide-react'
import { ExamStatusBadge } from '../ExamStatusBadge'

interface SearchResultTableProps {
  exams: Exam[]
  onSelect: (id: number) => void
}

export const SearchResultTable: React.FC<SearchResultTableProps> = ({
  exams,
  onSelect,
}) => {
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ'
      case 'medium':
        return 'Trung bình'
      case 'hard':
        return 'Khó'
      default:
        return difficulty
    }
  }

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-secondary)]">
          <tr>
            <th className="py-3 px-4 font-semibold w-16 whitespace-nowrap">ID</th>
            <th className="py-3 px-4 font-semibold whitespace-nowrap">Tiêu đề đề thi</th>
            <th className="py-3 px-4 font-semibold w-40 whitespace-nowrap">Môn học</th>
            <th className="py-3 px-4 font-semibold w-32 text-center whitespace-nowrap">Độ khó</th>
            <th className="py-3 px-4 font-semibold w-32 text-center whitespace-nowrap">Số câu hỏi</th>
            <th className="py-3 px-4 font-semibold w-32 text-center whitespace-nowrap">Thời gian</th>
            <th className="py-3 px-4 font-semibold w-36 whitespace-nowrap">Người tạo</th>
            <th className="py-3 px-4 font-semibold w-32 whitespace-nowrap">Ngày tạo</th>
            <th className="py-3 px-4 font-semibold w-36 text-center whitespace-nowrap">Trạng thái</th>
            <th className="py-3 px-4 font-semibold w-24 text-center whitespace-nowrap">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-secondary)] text-[var(--text-primary)]">
          {exams.map((exam) => (
            <tr
              key={exam.id}
              className="hover:bg-[var(--surface-secondary)]/50 transition-colors"
            >
              <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                #{exam.id}
              </td>
              <td className="py-3.5 px-4 font-medium max-w-xs truncate">
                <span
                  onClick={() => onSelect(exam.id)}
                  className="hover:text-[var(--accent-primary)] hover:underline cursor-pointer transition-colors"
                >
                  {exam.title}
                </span>
              </td>
              <td className="py-3.5 px-4 font-medium text-[var(--primary-color)]">
                {exam.subject}
              </td>
              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-block text-[11px] font-semibold border px-2 py-0.5 rounded-[var(--radius-sm)] ${getDifficultyClass(
                    exam.difficulty
                  )}`}
                >
                  {getDifficultyText(exam.difficulty)}
                </span>
              </td>
              <td className="py-3.5 px-4 text-center font-medium">
                {exam.questions.length}
              </td>
              <td className="py-3.5 px-4 text-center text-[var(--text-secondary)] font-medium">
                {exam.duration} ph
              </td>
              <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                {exam.author}
              </td>
              <td className="py-3.5 px-4 text-[var(--text-secondary)] text-xs font-medium">
                {exam.createdAt}
              </td>
              <td className="py-3.5 px-4 text-center">
                <ExamStatusBadge status={exam.status} />
              </td>
              <td className="py-3.5 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onSelect(exam.id)}
                  className="inline-flex items-center justify-center p-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-secondary)] transition-all"
                  title="Xem chi tiết"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default SearchResultTable
