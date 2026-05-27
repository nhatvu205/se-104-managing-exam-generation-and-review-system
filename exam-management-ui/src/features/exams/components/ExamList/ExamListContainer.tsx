import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { examService } from '../../services/exam.service'
import type { Exam } from '../../types/exam.types'
import { ExamFilters } from './ExamFilters'
import { ExamTable } from './ExamTable'
import { ExamCardGrid } from './ExamCardGrid'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/pagination/Pagination'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const ExamListContainer: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  // Fetch exams
  const fetchExams = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await examService.getExams()
      setExams(data)
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tải danh sách đề thi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  // Delete handler
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      try {
        const success = await examService.deleteExam(id)
        if (success) {
          setExams((prev) => prev.filter((e) => e.id !== id))
        }
      } catch (err: any) {
        alert(err?.message || 'Không thể xóa đề thi')
      }
    }
  }

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter ? exam.status === statusFilter : true
      const matchesSubject = subjectFilter ? exam.subject === subjectFilter : true
      return matchesSearch && matchesStatus && matchesSubject
    })
  }, [exams, searchTerm, statusFilter, subjectFilter])

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    hasPrev,
    hasNext,
  } = usePagination({
    totalItems: filteredExams.length,
    initialPageSize: 6,
  })

  // Paginated chunk
  const paginatedExams = useMemo(() => {
    return filteredExams.slice(startIndex, endIndex)
  }, [filteredExams, startIndex, endIndex])

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Danh sách đề thi</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Xem và quản lý tất cả các đề thi trong hệ thống.
          </p>
        </div>
        <Link
          to="/exams/create"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium h-11 px-4 text-sm bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Tạo đề thi mới
        </Link>
      </div>


      {error && (
        <div className="p-4 bg-[var(--danger-bg)] border border-[var(--danger)] text-[var(--danger)] rounded-[var(--radius-md)] text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter panel */}
      <ExamFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Responsive View Wrapper */}
      <div className="w-full">
        {/* Force card grid on mobile viewports using tailwind, toggles on desktop */}
        <div className={viewMode === 'table' ? 'hidden md:block' : 'hidden'}>
          <ExamTable
            exams={paginatedExams}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>

        <div className={viewMode === 'card' ? 'block' : 'block md:hidden'}>
          <ExamCardGrid
            exams={paginatedExams}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Pagination rendering */}
      {!loading && filteredExams.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasPrev={hasPrev}
          hasNext={hasNext}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
          totalItems={filteredExams.length}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      )}
    </div>
  )
}
export default ExamListContainer
