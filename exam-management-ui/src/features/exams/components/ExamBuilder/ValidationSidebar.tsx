import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { BuilderValidationResult } from '../../types/exam-builder.types'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

interface ValidationSidebarProps {
  validation: BuilderValidationResult
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  isMetadataValid: boolean
}

export const ValidationSidebar: React.FC<ValidationSidebarProps> = ({
  validation,
  onSave,
  onCancel,
  isSaving,
  isMetadataValid,
}) => {
  const {
    totalScore,
    isValidScore,
    questionCount,
    isValidQuestionCount,
    loCoveragePercent,
    isValidLoCoverage,
    errors,
  } = validation

  const allValid = isValidScore && isValidQuestionCount && isValidLoCoverage && isMetadataValid

  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-20 w-full lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1 scrollbar-thin">
      <Card className="p-5 flex flex-col gap-5 border border-[var(--border-primary)] shadow-sm bg-white">
        <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3 flex items-center justify-between">
          <span>Kiểm định chất lượng đề</span>
          {allValid ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)] flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Đạt chuẩn
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--danger-bg)] text-[var(--danger)]">
              Chưa đạt
            </span>
          )}
        </h3>

        {/* Validation Criteria Checklist */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2.5 text-sm">
            {isValidScore ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col">
              <span className="font-medium text-[var(--text-primary)]">Tổng điểm bằng 10.0</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">Hiện tại: {totalScore} / 10 điểm</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-sm">
            {isValidQuestionCount ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col">
              <span className="font-medium text-[var(--text-primary)]">Số lượng từ 5 - 25 câu hỏi</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">Hiện tại: {questionCount} câu hỏi</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-sm">
            {isValidLoCoverage ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col">
              <span className="font-medium text-[var(--text-primary)]">Bao phủ tối thiểu 2 chuẩn đầu ra</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">Độ bao phủ: {loCoveragePercent}%</span>
            </div>
          </div>
        </div>

        {/* Validation Errors Panel */}
        {errors.length > 0 && (
          <div className="p-3.5 bg-[var(--danger-bg)]/40 border border-[var(--danger-bg)] rounded-[var(--radius-md)] flex flex-col gap-2">
            <span className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider">
              Lỗi cấu trúc cần khắc phục:
            </span>
            <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] flex flex-col gap-1.5 leading-relaxed pl-1">
              {errors.map((err, idx) => (
                <li key={idx} className="list-item align-top">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sticky Actions */}
        <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-secondary)]">
          <Button
            type="button"
            variant="primary"
            className="w-full font-semibold"
            disabled={!allValid || isSaving}
            loading={isSaving}
            onClick={onSave}
          >
            Lưu và hoàn thành đề thi
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isSaving}
            onClick={onCancel}
          >
            Hủy bỏ
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default ValidationSidebar
