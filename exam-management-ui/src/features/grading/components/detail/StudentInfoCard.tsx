import React from 'react'
import { Card } from '@/components/ui/card'
import { User, Calendar } from 'lucide-react'

interface StudentInfoCardProps {
  name: string
  studentId: string
  submittedAt: string
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({
  name,
  studentId,
  submittedAt,
}) => {
  return (
    <Card className="p-4 border border-[var(--border-secondary)] bg-white rounded-[var(--radius-lg)] shadow-sm">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Thông tin học sinh
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[var(--primary-light)] text-[var(--primary-color)] flex items-center justify-center rounded-full shrink-0">
            <User className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">{name}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">Mã số: {studentId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 border-t border-[var(--border-secondary)] pt-2.5">
          <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span>Nộp bài: </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {new Date(submittedAt).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Card>
  )
}
export default StudentInfoCard
