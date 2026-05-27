import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useExamSearch } from '@/features/exams/hooks/useExamSearch'
import { SearchFilterBar } from '@/features/exams/components/search/SearchFilterBar'
import { SearchResultTable } from '@/features/exams/components/search/SearchResultTable'
import { SearchResultCard } from '@/features/exams/components/search/SearchResultCard'
import { SearchEmptyState } from '@/features/exams/components/search/SearchEmptyState'
import { Pagination } from '@/components/ui/pagination/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSearch2 } from 'lucide-react'

export const SearchExamPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    filters,
    setFilter,
    clearFilters,
    loading,
    error,
    filteredExams,
    paginatedExams,
    totalPages,
    uniqueSubjects,
  } = useExamSearch()

  const handleSelectExam = (id: number) => {
    navigate(`/exams/${id}/preview`)
  }

  const limit = 6
  const startIndex = (filters.page - 1) * limit
  const endIndex = Math.min(startIndex + limit, filteredExams.length)

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-[var(--bg-primary)] p-6 w-full">
      {/* Top Banner/Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[var(--primary-light)] text-[var(--primary-color)] flex items-center justify-center rounded-[var(--radius-md)]">
            <FileSearch2 className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Tra cứu đề thi</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Tìm kiếm nhanh và lọc thông tin chi tiết toàn bộ kho đề thi trong hệ thống
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Tổng số đề thi tìm thấy</span>
          <span className="text-2xl font-bold text-[var(--primary-color)]">{filteredExams.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        subjects={uniqueSubjects}
      />

      {/* Search Results Area */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-sm">
          <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <SearchEmptyState onClearFilters={clearFilters} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <SearchResultTable exams={paginatedExams} onSelect={handleSelectExam} />
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginatedExams.map((exam) => (
              <SearchResultCard key={exam.id} exam={exam} onSelect={handleSelectExam} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--border-secondary)] overflow-hidden shadow-sm">
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                hasPrev={filters.page > 1}
                hasNext={filters.page < totalPages}
                goToPage={(page) => setFilter('page', page)}
                nextPage={() => setFilter('page', filters.page + 1)}
                prevPage={() => setFilter('page', filters.page - 1)}
                totalItems={filteredExams.length}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default SearchExamPage
