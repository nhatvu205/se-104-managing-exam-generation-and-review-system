import React from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
  TableLoading,
} from '@/components/ui/table'
import type { Exam } from '../../types/exam.types'
import { ExamStatusBadge } from '../ExamStatusBadge'
import { Button } from '@/components/ui/button'
import { Eye, Trash2 } from 'lucide-react'

interface ExamTableProps {
  exams: Exam[]
  loading: boolean
  onDelete: (id: number) => void
}

export const ExamTable: React.FC<ExamTableProps> = ({ exams, loading, onDelete }) => {
  if (loading) {
    return <TableLoading cols={6} rows={5} />
  }

  if (exams.length === 0) {
    return <TableEmpty cols={6} message="Không tìm thấy đề thi nào phù hợp" />
  }

  return (
    <div className="w-full overflow-x-auto rounded-t-[var(--radius-lg)] border border-[var(--border-primary)] bg-white shadow-sm">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell isHeader className="w-16">ID</TableCell>
            <TableCell isHeader>Tên đề thi</TableCell>
            <TableCell isHeader>Môn học</TableCell>
            <TableCell isHeader className="text-center">Thời gian</TableCell>
            <TableCell isHeader className="text-center">Số câu hỏi</TableCell>
            <TableCell isHeader>Trạng thái</TableCell>
            <TableCell isHeader className="text-right w-28">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-semibold text-[var(--text-muted)]">#{exam.id}</TableCell>
              <TableCell className="font-medium text-[var(--text-primary)]">
                <Link to={`/exams/${exam.id}/preview`} className="hover:text-[var(--accent-primary)] transition-all">
                  {exam.title}
                </Link>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Tạo bởi {exam.author} • {exam.createdAt}
                </div>
              </TableCell>
              <TableCell className="text-[var(--text-secondary)]">{exam.subject}</TableCell>
              <TableCell className="text-center text-[var(--text-secondary)]">{exam.duration} phút</TableCell>
              <TableCell className="text-center text-[var(--text-secondary)]">{exam.questions.length} câu</TableCell>
              <TableCell>
                <ExamStatusBadge status={exam.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    to={`/exams/${exam.id}/preview`}
                    className="p-2 h-8 w-8 rounded-[var(--radius-md)] hover:bg-[var(--surface-secondary)] flex items-center justify-center transition-all duration-200"
                    aria-label="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4 text-[var(--text-secondary)]" />
                  </Link>
                  <Button
                    variant="tertiary"
                    size="sm"
                    className="p-2 h-8 w-8 hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]/20"
                    onClick={() => onDelete(exam.id)}
                    aria-label="Xóa đề thi"
                  >
                    <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                  </Button>
                </div>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
