import React from 'react'
import type { Exam } from '../../types/exam.types'
import { Calendar, User, FileText, ArrowRight } from 'lucide-react'
import { ExamStatusBadge } from '../ExamStatusBadge'

interface SearchResultCardProps {
  exam: Exam
  onSelect: (id: number) => void
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  exam,
  onSelect,
}) => {
  const difficultyLabel = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
  }[exam.difficulty]

  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200',
  }[exam.difficulty]

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-[var(--radius-lg)] border border-[var(--border-primary)] shadow-sm hover:shadow-md hover:border-[var(--border-secondary)] transition-all duration-200">
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
          #{exam.id}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-[var(--radius-sm)] ${difficultyColors}`}>
            {difficultyLabel}
          </span>
          <ExamStatusBadge status={exam.status} />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2 hover:text-[var(--accent-primary)] cursor-pointer" onClick={() => onSelect(exam.id)}>
          {exam.title}
        </h4>
        <span className="text-xs text-[var(--primary-color)] font-semibold">{exam.subject}</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-[var(--border-secondary)] pt-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span className="truncate">{exam.author}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span>{exam.createdAt}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span>{exam.questions.length} câu hỏi</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span>{exam.duration} phút</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(exam.id)}
        className="w-full flex items-center justify-center gap-1.5 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-primary)] hover:border-[var(--border-secondary)] transition-all"
      >
        Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
export default SearchResultCard
