import React from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Clock } from 'lucide-react'

interface ExamInfoCardProps {
  title: string
  duration: number
  maxScore: number
}

export const ExamInfoCard: React.FC<ExamInfoCardProps> = ({
  title,
  duration,
  maxScore,
}) => {
  return (
    <Card className="p-4 border border-[var(--border-secondary)] bg-white rounded-[var(--radius-lg)] shadow-sm">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Thông tin bài thi
      </h3>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <FileText className="h-4.5 w-4.5 text-[var(--primary-color)] mt-0.5 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">{title}</span>
            <span className="text-xs text-[var(--text-muted)] mt-0.5">Điểm tối đa: {maxScore}đ</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] border-t border-[var(--border-secondary)] pt-2.5 mt-0.5">
          <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span>Thời gian làm bài: </span>
          <span className="font-semibold text-[var(--text-primary)]">{duration} phút</span>
        </div>
      </div>
    </Card>
  )
}
export default ExamInfoCard
