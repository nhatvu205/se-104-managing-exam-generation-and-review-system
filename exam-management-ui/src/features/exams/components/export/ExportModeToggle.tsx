import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, ShieldAlert } from 'lucide-react'

interface ExportModeToggleProps {
  mode: 'student' | 'teacher'
  onChangeMode: (mode: 'student' | 'teacher') => void
}

export const ExportModeToggle: React.FC<ExportModeToggleProps> = ({
  mode,
  onChangeMode,
}) => {
  return (
    <div className="flex items-center bg-[var(--surface-secondary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-primary)] shrink-0">
      <Button
        type="button"
        variant={mode === 'student' ? 'primary' : 'tertiary'}
        size="sm"
        className="h-8 text-xs font-semibold"
        onClick={() => onChangeMode('student')}
      >
        <Eye className="h-3.5 w-3.5 mr-1" /> Chế độ Học sinh
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
  )
}
export default ExportModeToggle
