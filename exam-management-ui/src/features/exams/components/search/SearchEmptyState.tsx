import React from 'react'
import { EmptyState } from '@/components/ui/empty-state/EmptyState'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchEmptyStateProps {
  onClearFilters: () => void
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  onClearFilters,
}) => {
  return (
    <div className="py-12 bg-white rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
      <EmptyState
        icon={<Search className="h-7 w-7 text-[var(--text-muted)]" />}
        title="Không tìm thấy kết quả"
        description="Không tìm thấy đề thi nào phù hợp với bộ lọc tìm kiếm hiện tại của bạn. Vui lòng kiểm tra lại từ khóa hoặc xóa bớt tiêu chí lọc."
        action={
          <Button variant="primary" size="sm" onClick={onClearFilters}>
            Xóa bộ lọc tìm kiếm
          </Button>
        }
      />
    </div>
  )
}
export default SearchEmptyState
