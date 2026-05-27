import React from 'react'
import { Badge } from '@/components/ui/badge/Badge'
import type { ExamStatus } from '../types/exam.types'

interface ExamStatusBadgeProps {
  status: ExamStatus
}

const statusConfig: Record<
  ExamStatus,
  { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  draft: { label: 'Bản nháp', variant: 'neutral' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  published: { label: 'Đã xuất bản', variant: 'info' },
  archived: { label: 'Lưu trữ', variant: 'warning' },
}

export const ExamStatusBadge: React.FC<ExamStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { label: status, variant: 'neutral' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
export default ExamStatusBadge
