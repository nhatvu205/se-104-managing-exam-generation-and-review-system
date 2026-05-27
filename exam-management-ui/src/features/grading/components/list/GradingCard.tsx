import React from 'react'
import type { GradingRecord } from '../../types/grading.types'
import { Calendar, ArrowRight } from 'lucide-react'
import { GradingStatusBadge } from './GradingStatusBadge'

interface GradingCardProps {
  record: GradingRecord
  onSelect: (id: number) => void
}

export const GradingCard: React.FC<GradingCardProps> = ({
  record,
  onSelect,
}) => {
  const isGradedOrPublished = record.status === 'graded' || record.status === 'published'

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-[var(--radius-lg)] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
          #{record.studentId}
        </span>
        <GradingStatusBadge status={record.status} />
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug cursor-pointer hover:text-[var(--accent-primary)]" onClick={() => onSelect(record.id)}>
          {record.studentName}
        </h4>
        <span className="text-xs text-[var(--text-muted)] truncate">{record.examTitle}</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-[var(--border-secondary)] pt-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span className="truncate">
            {new Date(record.submittedAt).toLocaleDateString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span className="font-semibold text-xs text-[var(--text-primary)]">
            Điểm:{' '}
            <span className={isGradedOrPublished ? 'text-green-600 font-bold' : 'text-[var(--text-muted)] italic font-normal'}>
              {isGradedOrPublished ? `${record.totalScore}/${record.maxScore}` : 'Chưa có'}
            </span>
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelect(record.id)}
        className="w-full flex items-center justify-center gap-1.5 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-primary)] hover:border-[var(--border-secondary)] transition-all"
      >
        {record.status === 'ungraded' ? 'Bắt đầu chấm' : record.status === 'grading' ? 'Chấm tiếp' : 'Xem kết quả'}{' '}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
export default GradingCard
