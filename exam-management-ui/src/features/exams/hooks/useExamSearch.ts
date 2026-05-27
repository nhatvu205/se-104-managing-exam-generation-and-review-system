import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { examService } from '../services/exam.service'
import type { Exam } from '../types/exam.types'

export interface SearchFilters {
  q: string
  subject: string
  difficulty: string
  status: string
  page: number
}

export function useExamSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync search parameters from URL
  const filters = useMemo<SearchFilters>(() => {
    return {
      q: searchParams.get('q') || '',
      subject: searchParams.get('subject') || '',
      difficulty: searchParams.get('difficulty') || '',
      status: searchParams.get('status') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
    }
  }, [searchParams])

  // Update specific filter key
  const setFilter = (key: keyof SearchFilters, value: any) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value === null || value === undefined) {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
      // Reset page when any filter other than page changes
      if (key !== 'page') {
        next.set('page', '1')
      }
      return next
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  // Fetch all exams once
  useEffect(() => {
    const loadExams = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await examService.getExams()
        setExams(data)
      } catch (err: any) {
        setError(err?.message || 'Không thể tải danh sách đề thi')
      } finally {
        setLoading(false)
      }
    }
    loadExams()
  }, [])

  // Filter exams based on URL parameters
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Search text match
      if (filters.q) {
        const query = filters.q.toLowerCase()
        const titleMatch = exam.title.toLowerCase().includes(query)
        const idMatch = exam.id.toString() === query
        const authorMatch = exam.author.toLowerCase().includes(query)
        if (!titleMatch && !idMatch && !authorMatch) return false
      }

      // Subject filter
      if (filters.subject && exam.subject !== filters.subject) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty && exam.difficulty !== filters.difficulty) {
        return false
      }

      // Status filter
      if (filters.status && exam.status !== filters.status) {
        return false
      }

      return true
    })
  }, [exams, filters])

  // Paginated exams
  const limit = 6
  const totalPages = Math.ceil(filteredExams.length / limit) || 1
  const paginatedExams = useMemo(() => {
    const startIndex = (filters.page - 1) * limit
    return filteredExams.slice(startIndex, startIndex + limit)
  }, [filteredExams, filters.page, limit])

  // Extract unique subjects for options
  const uniqueSubjects = useMemo(() => {
    const subjects = exams.map((e) => e.subject)
    return Array.from(new Set(subjects))
  }, [exams])

  return {
    filters,
    setFilter,
    clearFilters,
    loading,
    error,
    filteredExams,
    paginatedExams,
    totalPages,
    uniqueSubjects,
  }
}
export default useExamSearch
