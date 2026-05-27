import {
  TableCell,
  TableRow,
} from '@/components/ui/table'

import type { Question } from '../types/question.types'

import { DifficultyBadge } from './DifficultyBadge'
import { QuestionStatusBadge } from './QuestionStatusBadge'

interface QuestionTableRowProps {
  question: Question
}

export function QuestionTableRow({
  question,
}: QuestionTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        {question.content}
      </TableCell>

      <TableCell>
        {question.subject}
      </TableCell>

      <TableCell>
        <DifficultyBadge
          difficulty={question.difficulty}
        />
      </TableCell>

      <TableCell>
        <QuestionStatusBadge
          status={question.status}
        />
      </TableCell>

      <TableCell>
        {question.createdAt}
      </TableCell>
    </TableRow>
  )
}