import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Eye, ArrowLeft, ShieldAlert } from 'lucide-react'

export type PreviewMode = 'student' | 'teacher'

interface PrintToolbarProps {
  mode: PreviewMode
  onChangeMode: (mode: PreviewMode) => void
  onBack: () => void
  onExport?: () => void
  title: string
}

export const PrintToolbar: React.FC<PrintToolbarProps> = ({
  mode,
  onChangeMode,
  onBack,
  onExport,
  title,
}) => {
  return (
    <div className="print-toolbar w-full border-b border-[var(--border-secondary)] bg-white/90 backdrop-blur-md sticky top-16 z-10 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm print:hidden">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" className="p-2 h-9 w-9" onClick={onBack} aria-label="Quay lại">
          <ArrowLeft className="h-4.5 w-4.5" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[var(--text-primary)] truncate max-w-xs md:max-w-md">
            Xem trước: {title}
          </h2>
          <span className="text-xs text-[var(--text-muted)] mt-0.5">Cấu hình chế độ hiển thị & In đề thi</span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Toggle Mode buttons */}
        <div className="flex items-center bg-[var(--surface-secondary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-primary)] shrink-0">
          <Button
            type="button"
            variant={mode === 'student' ? 'primary' : 'tertiary'}
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => onChangeMode('student')}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Học sinh
          </Button>
          <Button
            type="button"
            variant={mode === 'teacher' ? 'primary' : 'tertiary'}
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => onChangeMode('teacher')}
          >
            <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Giáo viên (Đáp án)
          </Button>
        </div>

        {onExport && (
          <Button variant="secondary" size="sm" className="flex items-center gap-1.5 shrink-0" onClick={onExport}>
            Tùy chỉnh & Xuất bản PDF
          </Button>
        )}

        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shrink-0" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> In đề thi (PDF)
        </Button>
      </div>
    </div>
  )
}
export default PrintToolbar
