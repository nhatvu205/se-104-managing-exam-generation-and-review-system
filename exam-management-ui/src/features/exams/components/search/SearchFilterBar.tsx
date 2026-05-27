import React from 'react'
import { Search, X } from 'lucide-react'
import type { SearchFilters } from '../../hooks/useExamSearch'
import { Button } from '@/components/ui/button'

interface SearchFilterBarProps {
  filters: SearchFilters
  setFilter: (key: keyof SearchFilters, value: any) => void
  clearFilters: () => void
  subjects: string[]
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  setFilter,
  clearFilters,
  subjects,
}) => {
  const hasActiveFilters = 
    filters.q !== '' || 
    filters.subject !== '' || 
    filters.difficulty !== '' || 
    filters.status !== ''

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, tác giả hoặc ID..."
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 lg:w-[500px]">
          <div>
            <select
              value={filters.subject}
              onChange={(e) => setFilter('subject', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
            >
              <option value="">Tất cả môn học</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilter('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
            >
              <option value="">Mọi độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
            >
              <option value="">Mọi trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 h-10 px-4"
          >
            <X className="h-4 w-4" /> Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}
export default SearchFilterBar
