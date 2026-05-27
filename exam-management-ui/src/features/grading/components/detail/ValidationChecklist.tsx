import React from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface ValidationChecklistProps {
  ungradedCount: number
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  ungradedCount,
}) => {
  const isFinished = ungradedCount === 0

  return (
    <div className="flex flex-col gap-2.5 bg-[var(--surface-secondary)] p-3.5 rounded-[var(--radius-lg)] border border-[var(--border-primary)] text-xs">
      <h4 className="font-semibold text-[var(--text-primary)]">Kiểm tra tính hợp lệ</h4>
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center gap-2">
          {isFinished ? (
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
          )}
          <span className={isFinished ? 'text-green-700 font-medium' : 'text-yellow-700'}>
            {isFinished
              ? 'Đã nhập điểm cho tất cả câu hỏi'
              : `Còn lại ${ungradedCount} câu hỏi chưa chấm`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          <span className="font-medium">Điểm số trong phạm vi giới hạn [0đ - Điểm tối đa]</span>
        </div>
      </div>
    </div>
  )
}
export default ValidationChecklist
