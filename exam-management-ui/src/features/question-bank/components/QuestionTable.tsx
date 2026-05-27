import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'

import { questions } from '../mock/questions.mock'

import { QuestionTableRow } from './QuestionTableRow'

export function QuestionTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell isHeader>
            Nội dung
          </TableCell>

          <TableCell isHeader>
            Môn học
          </TableCell>

          <TableCell isHeader>
            Độ khó
          </TableCell>

          <TableCell isHeader>
            Trạng thái
          </TableCell>

          <TableCell isHeader>
            Ngày tạo
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {questions.map((question) => (
          <QuestionTableRow
            key={question.id}
            question={question}
          />
        ))}
      </TableBody>
    </Table>
  )
}