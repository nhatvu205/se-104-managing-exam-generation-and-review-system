import { useState, useCallback, useMemo } from 'react'

export interface UsePaginationOptions {
  totalItems: number
  initialPage?: number
  initialPageSize?: number
}

export interface UsePaginationResult {
  currentPage: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
  hasPrev: boolean
  hasNext: boolean
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions): UsePaginationResult => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize))
  }, [totalItems, pageSize])

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(validPage)
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // Reset to first page on limit change
  }, [])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems)
  }, [startIndex, pageSize, totalItems])

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    hasPrev,
    hasNext,
  }
}
