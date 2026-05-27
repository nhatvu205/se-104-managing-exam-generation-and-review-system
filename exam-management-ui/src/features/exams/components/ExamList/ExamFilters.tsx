import React from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'

interface ExamFiltersProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  subjectFilter: string
  setSubjectFilter: (val: string) => void
  viewMode: 'table' | 'card'
  setViewMode: (mode: 'table' | 'card') => void
}

export const ExamFilters: React.FC<ExamFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  subjectFilter,
  setSubjectFilter,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--border-primary)] shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:flex-1">
        <Input
          placeholder="Tìm kiếm tên đề thi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="draft">Bản nháp</option>
          <option value="approved">Đã duyệt</option>
          <option value="published">Đã xuất bản</option>
          <option value="archived">Lưu trữ</option>
        </Select>

        <Select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full"
        >
          <option value="">-- Tất cả môn học --</option>
          <option value="Lập trình Web">Lập trình Web</option>
          <option value="Cơ sở dữ liệu">Cơ sở dữ liệu</option>
          <option value="Frontend nâng cao">Frontend nâng cao</option>
          <option value="Backend">Backend</option>
        </Select>
      </div>

      <div className="flex items-center gap-2 border-l border-[var(--border-secondary)] pl-4 hidden md:flex">
        <span className="text-xs text-[var(--text-muted)] font-medium mr-1">Chế độ xem:</span>
        <Button
          variant={viewMode === 'table' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setViewMode('table')}
          className="p-2 h-9 w-9"
          aria-label="Xem dạng bảng"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'card' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setViewMode('card')}
          className="p-2 h-9 w-9"
          aria-label="Xem dạng lưới"
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
