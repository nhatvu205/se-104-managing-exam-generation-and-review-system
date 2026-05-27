import React from 'react'
import type { GradingRecord } from '../../types/grading.types'
import { GradingStatusBadge } from './GradingStatusBadge'
import { Eye, ArrowRight, Award } from 'lucide-react'

interface GradingTableProps {
  records: GradingRecord[]
  onSelect: (id: number) => void
}

export const GradingTable: React.FC<GradingTableProps> = ({
  records,
  onSelect,
}) => {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-secondary)]">
          <tr>
            <th className="py-3 px-4 font-semibold w-24 whitespace-nowrap">Mã SV</th>
            <th className="py-3 px-4 font-semibold whitespace-nowrap">Tên học sinh</th>
            <th className="py-3 px-4 font-semibold whitespace-nowrap">Bài kiểm tra</th>
            <th className="py-3 px-4 font-semibold w-48 whitespace-nowrap">Thời gian nộp</th>
            <th className="py-3 px-4 font-semibold w-32 text-center whitespace-nowrap">Điểm số</th>
            <th className="py-3 px-4 font-semibold w-36 text-center whitespace-nowrap">Trạng thái</th>
            <th className="py-3 px-4 font-semibold w-32 text-center whitespace-nowrap">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-secondary)] text-[var(--text-primary)]">
          {records.map((rec) => {
            const isGradedOrPublished = rec.status === 'graded' || rec.status === 'published'

            return (
              <tr
                key={rec.id}
                className="hover:bg-[var(--surface-secondary)]/50 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                  {rec.studentId}
                </td>
                <td className="py-3.5 px-4 font-bold">
                  <span
                    onClick={() => onSelect(rec.id)}
                    className="hover:text-[var(--accent-primary)] hover:underline cursor-pointer transition-colors"
                  >
                    {rec.studentName}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium max-w-xs truncate">
                  {rec.examTitle}
                </td>
                <td className="py-3.5 px-4 text-[var(--text-secondary)] text-xs font-medium">
                  {new Date(rec.submittedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {isGradedOrPublished ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600">
                      <Award className="h-4 w-4" /> {rec.totalScore}/{rec.maxScore}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic font-medium">Chưa có</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <GradingStatusBadge status={rec.status} />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelect(rec.id)}
                    className={`inline-flex items-center justify-center px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-all ${
                      rec.status === 'ungraded'
                        ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/95 shadow-sm'
                        : rec.status === 'grading'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : 'border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    {rec.status === 'ungraded' ? (
                      <span className="flex items-center gap-1">Chấm ngay <ArrowRight className="h-3 w-3" /></span>
                    ) : rec.status === 'grading' ? (
                      <span className="flex items-center gap-1">Tiếp tục <ArrowRight className="h-3 w-3" /></span>
                    ) : (
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Xem</span>
                    )}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default GradingTable
