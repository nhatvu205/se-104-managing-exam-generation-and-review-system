import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import { ExportModeToggle } from './ExportModeToggle'

interface ExportToolbarProps {
  title: string
  mode: 'student' | 'teacher'
  onChangeMode: (mode: 'student' | 'teacher') => void
  onBack: () => void
  onPrint: () => void
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  title,
  mode,
  onChangeMode,
  onBack,
  onPrint,
}) => {
  return (
    <div className="print:hidden border-b border-[var(--border-secondary)] bg-white/90 backdrop-blur-md sticky top-16 z-10 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="p-2 h-9 w-9"
          onClick={onBack}
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[var(--text-primary)] truncate max-w-xs md:max-w-md">
            Xuất đề thi: {title}
          </h2>
          <span className="text-xs text-[var(--text-muted)] mt-0.5">Cấu hình chi tiết hiển thị, đáp án và căn lề trước khi xuất PDF</span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <ExportModeToggle mode={mode} onChangeMode={onChangeMode} />
        
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 shrink-0"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4" /> Xuất bản (PDF / In)
        </Button>
      </div>
    </div>
  )
}
export default ExportToolbar
