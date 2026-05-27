import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'

import { recentExams } from '../mock/dashboard.mock'

export function RecentExamTable() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          Đề thi gần đây
        </h2>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell isHeader>
              Tên đề thi
            </TableCell>

            <TableCell isHeader>
              Môn học
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
          {recentExams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>
                {exam.title}
              </TableCell>

              <TableCell>
                {exam.subject}
              </TableCell>

              <TableCell>
                {exam.status}
              </TableCell>

              <TableCell>
                {exam.createdAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}