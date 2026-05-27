import React from 'react'
import type { GradingStatus } from '../../types/grading.types'

interface GradingStatusBadgeProps {
  status: GradingStatus
}

export const GradingStatusBadge: React.FC<GradingStatusBadgeProps> = ({
  status,
}) => {
  const labels = {
    ungraded: 'Chưa chấm',
    grading: 'Đang chấm',
    graded: 'Đã chấm',
    published: 'Đã công bố',
  }

  const styles = {
    ungraded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    grading: 'bg-blue-50 text-blue-700 border-blue-200',
    graded: 'bg-green-50 text-green-700 border-green-200',
    published: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 border rounded-[var(--radius-sm)] text-[11px] font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
export default GradingStatusBadge
