import React from 'react'
import { PrintableHeader } from './PrintableHeader'
import { PrintableQuestion } from './PrintableQuestion'
import type { Exam } from '../../../types/exam.types'
import type { PreviewMode } from '../toolbar/PrintToolbar'

interface PrintableExamProps {
  exam: Exam
  mode: PreviewMode
}

export const PrintableExam: React.FC<PrintableExamProps> = ({ exam, mode }) => {
  return (
    <div className="printable-exam-container flex flex-col gap-8 w-full bg-white p-8 max-w-4xl mx-auto shadow-md rounded-[var(--radius-lg)] border border-[var(--border-primary)] print:border-none print:shadow-none print:p-0">
      {/* HEADER SECTION */}
      <PrintableHeader
        title={exam.title}
        subject={exam.subject}
        duration={exam.duration}
        academicYear={exam.academicYear}
        semester={exam.semester}
      />

      {/* INSTRUCTIONS */}
      <div className="text-xs italic text-black/80 font-serif leading-relaxed">
        * Thí sinh không được sử dụng tài liệu. Giám thị không giải thích gì thêm.
      </div>

      {/* QUESTIONS SECTION */}
      {exam.questions.length === 0 ? (
        <div className="text-center py-10 italic text-sm font-serif text-black/70">
          Chưa có câu hỏi nào trong đề thi này.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {exam.questions.map((question, index) => (
            <PrintableQuestion
              key={question.id}
              question={question}
              index={index}
              mode={mode}
            />
          ))}
        </div>
      )}

      {/* FOOTER SECTION */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-black/30 text-xs font-serif text-black/70 print:page-break-inside-avoid">
        <span>Mã đề thi: #{exam.id}</span>
        <span>HẾT</span>
        <span>Trang 1 / 1</span>
      </div>
    </div>
  )
}
export default PrintableExam
