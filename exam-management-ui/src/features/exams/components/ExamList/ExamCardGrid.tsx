import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import type { Exam } from '../../types/exam.types'
import { ExamStatusBadge } from '../ExamStatusBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge/Badge'
import { Eye, Trash2, Calendar, User, Clock, FileText } from 'lucide-react'

interface ExamCardGridProps {
  exams: Exam[]
  loading: boolean
  onDelete: (id: number) => void
}

export const ExamCardGrid: React.FC<ExamCardGridProps> = ({ exams, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="p-5 flex flex-col gap-4 animate-pulse">
            <div className="h-6 w-2/3 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded-md"></div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-secondary)]">
              <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <Card className="p-8 text-center text-[var(--text-secondary)]">
        Không tìm thấy đề thi nào phù hợp
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <Card
          key={exam.id}
          className="p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200 border border-[var(--border-primary)]"
        >
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-base text-[var(--text-primary)] leading-snug line-clamp-2">
              <Link to={`/exams/${exam.id}/preview`} className="hover:text-[var(--accent-primary)] transition-all">
                {exam.title}
              </Link>
            </h4>
            <ExamStatusBadge status={exam.status} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info">{exam.subject}</Badge>
            <Badge variant="neutral">
              {exam.difficulty === 'easy' ? 'Dễ' : exam.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)] mt-1 pt-1 border-t border-[var(--border-secondary)]">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>{exam.duration} phút</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>{exam.questions.length} câu hỏi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="truncate">{exam.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>{exam.createdAt}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-secondary)]">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              #{exam.id}
            </span>
            <div className="flex items-center gap-2">
              <Link
                to={`/exams/${exam.id}/preview`}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" /> Chi tiết
              </Link>
              <Button
                variant="tertiary"
                size="sm"
                className="p-1.5 h-8 w-8 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]/20"
                onClick={() => onDelete(exam.id)}
                aria-label="Xóa đề thi"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
export default ExamCardGrid
