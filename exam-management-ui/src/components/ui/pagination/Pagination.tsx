import React from 'react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  totalItems?: number
  startIndex?: number
  endIndex?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasPrev,
  hasNext,
  goToPage,
  nextPage,
  prevPage,
  totalItems,
  startIndex = 0,
  endIndex = 0,
}) => {
  const pages = React.useMemo(() => {
    const range = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-[var(--border-secondary)] bg-white rounded-b-[var(--radius-md)] text-sm text-[var(--text-secondary)]">
      <div>
        {totalItems !== undefined && (
          <span>
            Hiển thị <span className="font-semibold text-[var(--text-primary)]">{startIndex + 1}</span> -{' '}
            <span className="font-semibold text-[var(--text-primary)]">{endIndex}</span> trong tổng số{' '}
            <span className="font-semibold text-[var(--text-primary)]">{totalItems}</span> mục
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={prevPage}
          disabled={!hasPrev}
          aria-label="Trang trước"
        >
          Trước
        </Button>

        {pages[0] > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => goToPage(1)}
            >
              1
            </Button>
            {pages[0] > 2 && <span className="px-2 text-[var(--text-muted)]">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-[var(--text-muted)]">...</span>
            )}
            <Button
              variant={currentPage === totalPages ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={nextPage}
          disabled={!hasNext}
          aria-label="Trang sau"
        >
          Sau
        </Button>
      </div>
    </div>
  )
}
