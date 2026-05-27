import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examService } from '@/features/exams/services/exam.service'
import type { Exam } from '@/features/exams/types/exam.types'
import type { ExportSettings } from '@/features/exams/types/export.types'
import { ExportToolbar } from '@/features/exams/components/export/ExportToolbar'
import { ExportSettingsPanel } from '@/features/exams/components/export/ExportSettingsPanel'
import { ExportMetadataCard } from '@/features/exams/components/export/ExportMetadataCard'
import { ExportPreviewPanel } from '@/features/exams/components/export/ExportPreviewPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export const PdfExportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Custom print metadata overrides
  const [overrideMeta, setOverrideMeta] = useState({
    title: '',
    subject: '',
    duration: 90,
    academicYear: '2025-2026',
    semester: 'Học kỳ I',
  })

  // Page print options
  const [settings, setSettings] = useState<ExportSettings>({
    mode: 'student',
    showMetadata: true,
    showInstructions: true,
    showStudentCard: true,
    margin: 'normal',
    fontSize: 'base',
    twoColumnChoices: false,
  })

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await examService.getExamById(parseInt(id))
        if (data) {
          setExam(data)
          setOverrideMeta({
            title: data.title,
            subject: data.subject,
            duration: data.duration,
            academicYear: data.academicYear,
            semester: data.semester,
          })
        } else {
          setError('Không tìm thấy đề thi này trong hệ thống')
        }
      } catch (err: any) {
        setError(err?.message || 'Có lỗi xảy ra khi tải dữ liệu đề thi')
      } finally {
        setLoading(false)
      }
    }
    fetchExam()
  }, [id])

  const handleBack = () => {
    navigate(`/exams/${id}/preview`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleMetaChange = (field: string, value: any) => {
    setOverrideMeta((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSettingChange = <K extends keyof ExportSettings>(
    key: K,
    value: ExportSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 min-h-screen bg-[var(--bg-primary)] w-full">
        <Skeleton className="h-16 w-full rounded-[var(--radius-md)]" />
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto flex-1">
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-[297mm] w-full rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
        <div className="p-8 text-center max-w-md mx-auto bg-white border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-sm">
          <p className="text-sm font-semibold text-[var(--danger)]">{error || 'Có lỗi xảy ra'}</p>
          <button
            onClick={() => navigate('/exams')}
            className="mt-4 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-all duration-200"
          >
            Quay lại danh sách đề thi
          </button>
        </div>
      </div>
    )
  }

  // Prepared exam object containing overrides
  const preparedExam: Exam = {
    ...exam,
    title: overrideMeta.title,
    subject: overrideMeta.subject,
    duration: overrideMeta.duration,
    academicYear: overrideMeta.academicYear,
    semester: overrideMeta.semester,
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] w-full pb-10 print:pb-0 print:bg-white">
        {/* Sticky Toolbar */}
        <ExportToolbar
          title={exam.title}
          mode={settings.mode}
          onChangeMode={(mode) => handleSettingChange('mode', mode)}
          onBack={handleBack}
          onPrint={handlePrint}
        />

        {/* Dashboard Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 print:p-0 print:m-0 print:max-w-none">
          {/* Controls Sidebar (Hidden during Printing) */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 print:hidden">
            <ExportMetadataCard
              title={overrideMeta.title}
              subject={overrideMeta.subject}
              duration={overrideMeta.duration}
              academicYear={overrideMeta.academicYear}
              semester={overrideMeta.semester}
              onChange={handleMetaChange}
            />
            <ExportSettingsPanel
              settings={settings}
              onChangeSetting={handleSettingChange}
            />
          </div>

          {/* Page Preview (Centered in Content Area) */}
          <div className="flex-1 flex justify-center items-start print:block print:w-full">
            <ExportPreviewPanel exam={preparedExam} settings={settings} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
export default PdfExportPage
