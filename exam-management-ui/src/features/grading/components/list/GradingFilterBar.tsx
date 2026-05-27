import React from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GradingFilterBarProps {
  query: string
  onChangeQuery: (q: string) => void
  status: string
  onChangeStatus: (status: string) => void
  onClear: () => void
}

export const GradingFilterBar: React.FC<GradingFilterBarProps> = ({
  query,
  onChangeQuery,
  status,
  onChangeStatus,
  onClear,
}) => {
  const hasActiveFilters = query !== '' || status !== ''

  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Tìm tên học sinh hoặc Mã SV..."
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
        />
      </div>

      {/* Select Filter */}
      <div className="flex gap-2 shrink-0">
        <select
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
          className="px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)] min-w-[160px]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ungraded">Chưa chấm</option>
          <option value="grading">Đang chấm</option>
          <option value="graded">Đã chấm</option>
          <option value="published">Đã công bố</option>
        </select>

        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClear}
            className="flex items-center justify-center gap-1.5 h-10 px-4 whitespace-nowrap"
          >
            <X className="h-4 w-4" /> Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}
export default GradingFilterBar
