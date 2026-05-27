import {
  AlertCircle,
  CheckCircle2,
  Flag,
  Pencil,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export type QuestionStatus =
  | 'draft'
  | 'complete'
  | 'flagged'
  | 'error'

interface QuestionStatusBadgeProps {
  status: QuestionStatus
}

const statusMap = {
  draft: {
    label: 'Đang soạn',
    variant: 'warning' as const,
    icon: Pencil,
  },

  complete: {
    label: 'Hoàn chỉnh',
    variant: 'success' as const,
    icon: CheckCircle2,
  },

  flagged: {
    label: 'Đã đánh dấu',
    variant: 'info' as const,
    icon: Flag,
  },

  error: {
    label: 'Thiếu dữ liệu',
    variant: 'danger' as const,
    icon: AlertCircle,
  },
}

export function QuestionStatusBadge({
  status,
}: QuestionStatusBadgeProps) {
  const config = statusMap[status]

  const Icon = config.icon

  return (
    <Badge variant={config.variant}>
      <Icon size={12} />

      <span>{config.label}</span>
    </Badge>
  )
}