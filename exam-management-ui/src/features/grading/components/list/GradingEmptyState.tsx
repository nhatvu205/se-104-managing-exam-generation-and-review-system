import React from 'react'
import { EmptyState } from '@/components/ui/empty-state/EmptyState'
import { FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GradingEmptyStateProps {
  onClear: () => void
}

export const GradingEmptyState: React.FC<GradingEmptyStateProps> = ({
  onClear,
}) => {
  return (
    <div className="py-12 bg-white rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
      <EmptyState
        icon={<FileEdit className="h-7 w-7 text-[var(--text-muted)]" />}
        title="Không tìm thấy yêu cầu chấm điểm"
        description="Không tìm thấy học sinh hoặc yêu cầu chấm điểm nào khớp với tiêu chuẩn tìm kiếm hiện tại."
        action={
          <Button variant="primary" size="sm" onClick={onClear}>
            Xóa bộ lọc tìm kiếm
          </Button>
        }
      />
    </div>
  )
}
export default GradingEmptyState
