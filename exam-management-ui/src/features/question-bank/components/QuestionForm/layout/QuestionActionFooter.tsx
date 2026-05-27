import React from 'react'
import { Button } from '@/components/ui/button'

interface QuestionActionFooterProps {
  onCancel: () => void
  isSubmitting: boolean
  isValid: boolean
}

export const QuestionActionFooter: React.FC<QuestionActionFooterProps> = ({
  onCancel,
  isSubmitting,
  isValid,
}) => {
  return (
    <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 z-30 border-t border-[var(--border-secondary)] bg-white/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center shadow-lg transition-all duration-200 print:hidden">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Hủy bỏ
      </Button>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="secondary"
          disabled={isSubmitting}
          name="save-draft"
        >
          Lưu bản nháp
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          name="save-complete"
        >
          Lưu hoàn thành
        </Button>
      </div>
    </div>
  )
}
