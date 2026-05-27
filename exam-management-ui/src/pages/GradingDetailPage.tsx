import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGradingDetailStore,
  selectTotalScore,
  selectMaxScore,
  selectAnswers,
  selectGradedCount,
} from '@/features/grading/stores/grading-detail.store'
import { examService } from '@/features/exams/services/exam.service'
import type { Exam } from '@/features/exams/types/exam.types'
import { GradingQuestionCard } from '@/features/grading/components/detail/GradingQuestionCard'
import { GradingSummarySidebar } from '@/features/grading/components/detail/GradingSummarySidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, CheckSquare, Sparkles } from 'lucide-react'

export const GradingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    record,
    loading,
    error,
    isDirty,
    draftUpdatedAt,
    loadRecord,
    updateAnswerScore,
    updateAnswerFeedback,
    saveDraft,
    publishGrades,
  } = useGradingDetailStore()

  // Selectors
  const totalScore = useGradingDetailStore(selectTotalScore)
  const maxScore = useGradingDetailStore(selectMaxScore)
  const answers = useGradingDetailStore(selectAnswers)
  const gradedCount = useGradingDetailStore(selectGradedCount)

  const [exam, setExam] = useState<Exam | null>(null)

  useEffect(() => {
    if (id) {
      loadRecord(parseInt(id))
    }
  }, [id])

  useEffect(() => {
    if (record?.examId) {
      examService.getExamById(record.examId).then((data) => {
        if (data) setExam(data)
      })
    }
  }, [record?.examId])

  const handleBack = () => {
    navigate('/grading')
  }

  if (loading && !record) {
    return (
      <div className="flex flex-col gap-6 p-6 min-h-screen bg-[var(--bg-primary)] w-full">
        <Skeleton className="h-16 w-full rounded-[var(--radius-md)]" />
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto flex-1">
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-48 w-full rounded-[var(--radius-lg)]" />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <Skeleton className="h-96 w-full rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
        <div className="p-8 text-center max-w-md mx-auto bg-white border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-sm">
          <p className="text-sm font-semibold text-[var(--danger)]">{error || 'Có lỗi xảy ra'}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBack}
            className="mt-4"
          >
            Quay lại trang danh sách chấm thi
          </Button>
        </div>
      </div>
    )
  }

  const isFinished = gradedCount === answers.length

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] w-full pb-24 lg:pb-10">
      {/* Top sticky detail header */}
      <div className="border-b border-[var(--border-secondary)] bg-white/90 backdrop-blur-md sticky top-16 z-10 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="p-2 h-9 w-9"
            onClick={handleBack}
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-[var(--text-primary)] truncate max-w-xs md:max-w-md">
              Chấm điểm: {record.studentName} ({record.studentId})
            </h2>
            <span className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
              <span>Đề thi: {record.examTitle}</span>
              {draftUpdatedAt && (
                <>
                  <span className="h-1 w-1 bg-[var(--border-secondary)] rounded-full" />
                  <span className="italic flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-orange-500" /> Nháp tự động lưu lúc {new Date(draftUpdatedAt).toLocaleTimeString('vi-VN')}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Indicators */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isDirty && (
            <span className="text-xs text-orange-500 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500 inline-block animate-pulse" /> Đã có thay đổi chưa lưu
            </span>
          )}
        </div>
      </div>

      {/* Detail Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side: Student Answers */}
        <div className="flex-1 flex flex-col gap-6">
          {answers.map((answer, index) => {
            const originalQuestion = exam?.questions.find((q) => q.id === answer.questionId)
            const questionContent = originalQuestion?.content || 'Câu hỏi tự luận'

            return (
              <GradingQuestionCard
                key={answer.questionId}
                answer={answer}
                index={index}
                questionContent={questionContent}
                onChangeScore={(score) => updateAnswerScore(answer.questionId, score)}
                onChangeFeedback={(feedback) => updateAnswerFeedback(answer.questionId, feedback)}
              />
            )
          })}
        </div>

        {/* Right Side: Sticky Summary Sidebar (Desktop Only) */}
        <div className="hidden lg:block w-full lg:w-80 shrink-0 sticky top-[148px] h-fit print:hidden">
          <GradingSummarySidebar
            studentName={record.studentName}
            studentId={record.studentId}
            submittedAt={record.submittedAt}
            examTitle={record.examTitle}
            duration={exam?.duration || 90}
            totalScore={totalScore}
            maxScore={maxScore}
            gradedCount={gradedCount}
            totalQuestions={answers.length}
            isDirty={isDirty}
            onSaveDraft={saveDraft}
            onPublish={publishGrades}
          />
        </div>
      </div>

      {/* Sticky bottom toolbar (Mobile/Tablet Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--border-secondary)] p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Tổng điểm tạm tính</span>
          <span className="text-base font-bold text-green-600">
            {totalScore.toFixed(2)} / {maxScore}đ
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">
            Đã chấm {gradedCount}/{answers.length} câu
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={saveDraft}
            className="flex items-center gap-1.5 font-bold h-10 px-3.5"
          >
            <Save className="h-4 w-4" /> Lưu
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!isFinished}
            onClick={publishGrades}
            className="flex items-center gap-1.5 font-bold h-10 px-4"
          >
            <CheckSquare className="h-4 w-4" /> Công bố
          </Button>
        </div>
      </div>
    </div>
  )
}
export default GradingDetailPage
