import React from 'react'
import { CheckCircle2 } from 'lucide-react'

interface RubricItem {
  id: string
  criteria: string
  points: number
}

interface RubricSectionProps {
  rubrics?: RubricItem[]
}

export const RubricSection: React.FC<RubricSectionProps> = ({
  rubrics = [
    { id: 'r1', criteria: 'Trả lời đúng định hướng và kết quả chính xác', points: 6 },
    { id: 'r2', criteria: 'Giải thích thuật toán, các bước giải chi tiết, rõ ràng', points: 3 },
    { id: 'r3', criteria: 'Trình bày code/hình vẽ minh họa dễ đọc, tối ưu', points: 1 },
  ],
}) => {
  return (
    <div className="flex flex-col gap-2 mt-2 bg-[var(--surface-secondary)] p-3 rounded-[var(--radius-md)] border border-[var(--border-primary)]">
      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
        Tiêu chí chấm điểm (Rubric)
      </span>
      <div className="flex flex-col gap-2 mt-1.5 text-xs">
        {rubrics.map((rub) => (
          <div key={rub.id} className="flex justify-between items-start gap-3 text-[var(--text-secondary)]">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--text-muted)] mt-0.5 shrink-0" />
              <span>{rub.criteria}</span>
            </div>
            <span className="font-bold text-[var(--text-primary)] shrink-0">{rub.points}đ</span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default RubricSection
