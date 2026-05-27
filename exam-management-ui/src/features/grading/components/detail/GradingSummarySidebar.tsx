import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentInfoCard } from './StudentInfoCard'
import { ExamInfoCard } from './ExamInfoCard'
import { ValidationChecklist } from './ValidationChecklist'
import { Save, CheckSquare } from 'lucide-react'

interface GradingSummarySidebarProps {
  studentName: string
  studentId: string
  submittedAt: string
  examTitle: string
  duration: number
  totalScore: number
  maxScore: number
  gradedCount: number
  totalQuestions: number
  isDirty: boolean
  onSaveDraft: () => void
  onPublish: () => void
}

export const GradingSummarySidebar: React.FC<GradingSummarySidebarProps> = ({
  studentName,
  studentId,
  submittedAt,
  examTitle,
  duration,
  totalScore,
  maxScore,
  gradedCount,
  totalQuestions,
  isDirty,
  onSaveDraft,
  onPublish,
}) => {
  const percentComplete = Math.round((gradedCount / totalQuestions) * 100) || 0
  const isFinished = gradedCount === totalQuestions

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Student Details */}
      <StudentInfoCard
        name={studentName}
        studentId={studentId}
        submittedAt={submittedAt}
      />

      {/* Exam Details */}
      <ExamInfoCard
        title={examTitle}
        duration={duration}
        maxScore={maxScore}
      />

      {/* Score Summary & Progress */}
      <Card className="p-4 border border-[var(--border-secondary)] bg-white rounded-[var(--radius-lg)] shadow-sm">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Tiến trình & Tổng điểm
        </h3>

        <div className="flex flex-col gap-4 text-sm">
          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium text-[var(--text-secondary)]">
              <span>Đã chấm</span>
              <span>{gradedCount} / {totalQuestions} câu hỏi ({percentComplete}%)</span>
            </div>
            <div className="w-full h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <div className="h-px bg-[var(--border-secondary)] my-0.5" />

          {/* Current Score Block */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[var(--text-secondary)]">Tổng điểm tạm tính:</span>
            <span className="text-2xl font-bold text-green-600">
              {totalScore.toFixed(2)} / {maxScore}đ
            </span>
          </div>

          {/* Validation checklist */}
          <ValidationChecklist
            ungradedCount={totalQuestions - gradedCount}
          />

          <div className="h-px bg-[var(--border-secondary)] my-0.5" />

          {/* Main Action buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSaveDraft}
              className="w-full flex items-center justify-center gap-1.5 h-10 font-bold"
            >
              <Save className="h-4 w-4" /> Lưu bản nháp {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!isFinished}
              onClick={onPublish}
              className="w-full flex items-center justify-center gap-1.5 h-10 font-bold"
            >
              <CheckSquare className="h-4 w-4" /> Hoàn tất & Công bố
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
export default GradingSummarySidebar
