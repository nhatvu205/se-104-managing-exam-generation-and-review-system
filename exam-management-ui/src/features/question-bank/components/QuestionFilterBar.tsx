import React from 'react'
import { Search } from 'lucide-react'

export const QuestionFilterBar: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Tìm kiếm câu hỏi..."
          className="w-full pl-9 pr-4 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
        />
      </div>
      <div className="flex gap-2">
        <select className="px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]">
          <option value="">Tất cả môn</option>
        </select>
        <select className="px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-[var(--text-primary)]">
          <option value="">Độ khó</option>
        </select>
      </div>
    </div>
  )
}
export default QuestionFilterBar
