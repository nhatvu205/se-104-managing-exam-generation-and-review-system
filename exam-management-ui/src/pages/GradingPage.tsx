import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { gradingService } from '@/features/grading/services/grading.service'
import type { GradingRecord } from '@/features/grading/types/grading.types'
import { GradingFilterBar } from '@/features/grading/components/list/GradingFilterBar'
import { GradingTable } from '@/features/grading/components/list/GradingTable'
import { GradingCard } from '@/features/grading/components/list/GradingCard'
import { GradingEmptyState } from '@/features/grading/components/list/GradingEmptyState'
import { Pagination } from '@/components/ui/pagination/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardCheck } from 'lucide-react'

export const GradingPage: React.FC = () => {
  const navigate = useNavigate()
  
  const [records, setRecords] = useState<GradingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await gradingService.getGradingRecords()
        setRecords(data)
      } catch (err: any) {
        setError(err?.message || 'Có lỗi xảy ra khi tải danh sách chấm điểm')
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [])

  const handleSelectRecord = (id: number) => {
    navigate(`/grading/${id}`)
  }

  const handleClearFilters = () => {
    setQuery('')
    setStatus('')
    setPage(1)
  }

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (query) {
        const lowerQ = query.toLowerCase()
        const nameMatch = rec.studentName.toLowerCase().includes(lowerQ)
        const idMatch = rec.studentId.toLowerCase().includes(lowerQ)
        if (!nameMatch && !idMatch) return false
      }
      if (status && rec.status !== status) {
        return false
      }
      return true
    })
  }, [records, query, status])

  // Pagination details
  const limit = 5
  const totalPages = Math.ceil(filteredRecords.length / limit) || 1
  const startIndex = (page - 1) * limit
  const endIndex = Math.min(startIndex + limit, filteredRecords.length)

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(startIndex, startIndex + limit)
  }, [filteredRecords, page])

  const handleSetPage = (p: number) => {
    setPage(p)
  }

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-[var(--bg-primary)] p-6 w-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[var(--primary-light)] text-[var(--primary-color)] flex items-center justify-center rounded-[var(--radius-md)]">
            <ClipboardCheck className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Chấm điểm học sinh</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Chấm thi tự luận, phê duyệt điểm số trắc nghiệm, và công bố điểm thi cho học sinh
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 bg-[var(--surface-secondary)] p-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] font-medium">
          <div className="flex flex-col items-center px-3 border-r border-[var(--border-secondary)]">
            <span>Chưa chấm</span>
            <span className="text-base font-bold text-yellow-600">
              {records.filter((r) => r.status === 'ungraded').length}
            </span>
          </div>
          <div className="flex flex-col items-center px-3 border-r border-[var(--border-secondary)]">
            <span>Đang chấm</span>
            <span className="text-base font-bold text-blue-600">
              {records.filter((r) => r.status === 'grading').length}
            </span>
          </div>
          <div className="flex flex-col items-center px-3">
            <span>Đã hoàn thành</span>
            <span className="text-base font-bold text-green-600">
              {records.filter((r) => r.status === 'graded' || r.status === 'published').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <GradingFilterBar
        query={query}
        onChangeQuery={(q) => {
          setQuery(q)
          setPage(1)
        }}
        status={status}
        onChangeStatus={(s) => {
          setStatus(s)
          setPage(1)
        }}
        onClear={handleClearFilters}
      />

      {/* Main Listing Area */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-48 w-full rounded-[var(--radius-lg)]" />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-sm">
          <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <GradingEmptyState onClear={handleClearFilters} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Desktop view */}
          <div className="hidden lg:block">
            <GradingTable records={paginatedRecords} onSelect={handleSelectRecord} />
          </div>

          {/* Mobile view */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginatedRecords.map((rec) => (
              <GradingCard key={rec.id} record={rec} onSelect={handleSelectRecord} />
            ))}
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--border-secondary)] overflow-hidden shadow-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                hasPrev={page > 1}
                hasNext={page < totalPages}
                goToPage={handleSetPage}
                nextPage={() => handleSetPage(page + 1)}
                prevPage={() => handleSetPage(page - 1)}
                totalItems={filteredRecords.length}
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
export default GradingPage
