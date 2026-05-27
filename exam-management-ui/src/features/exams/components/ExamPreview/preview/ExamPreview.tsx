import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { examService } from '../../../services/exam.service'
import type { Exam } from '../../../types/exam.types'
import { PrintToolbar, type PreviewMode } from '../toolbar/PrintToolbar'
import { PrintableExam } from '../print/PrintableExam'
import { Skeleton } from '@/components/ui/skeleton'

export const ExamPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<PreviewMode>('student')

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await examService.getExamById(parseInt(id))
        if (data) {
          setExam(data)
        } else {
          setError('Không tìm thấy đề thi này trong hệ thống')
        }
      } catch (err: any) {
        setError(err?.message || 'Có lỗi xảy ra khi tải đề thi')
      } finally {
        setLoading(false)
      }
    }
    fetchExam()
  }, [id])

  const handleBack = () => {
    navigate('/exams')
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-6 min-h-screen bg-[var(--bg-primary)] w-full">
        {loading ? (
          <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            <Skeleton className="h-16 w-full rounded-[var(--radius-md)]" />
            <Skeleton className="h-96 w-full rounded-[var(--radius-lg)]" />
          </div>
        ) : error ? (
          <div className="p-8 text-center max-w-md mx-auto my-12 bg-white border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-sm">
            <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-all duration-200"
            >
              Quay lại danh sách
            </button>
          </div>
        ) : exam ? (
          <>
            <PrintToolbar
              mode={mode}
              onChangeMode={setMode}
              onBack={handleBack}
              onExport={() => navigate(`/exams/${id}/export`)}
              title={exam.title}
            />

            <div className="flex-1 p-6 md:p-8 flex justify-center w-full">
              <PrintableExam exam={exam} mode={mode} />
            </div>
          </>
        ) : null}
      </div>
    </ErrorBoundary>
  )
}
export default ExamPreview
