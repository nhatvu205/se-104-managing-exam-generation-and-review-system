import React from 'react'
import type { Exam } from '../../types/exam.types'
import type { ExportSettings } from '../../types/export.types'

interface ExportPreviewPanelProps {
  exam: Exam
  settings: ExportSettings
}

export const ExportPreviewPanel: React.FC<ExportPreviewPanelProps> = ({
  exam,
  settings,
}) => {
  const marginClasses = {
    compact: 'p-4',
    normal: 'p-8',
    wide: 'p-12',
  }

  const fontSizeClasses = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
  }

  const titleFontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div
      id="printable-exam-area"
      className={`w-full bg-white text-black font-serif shadow-md border border-[var(--border-primary)] rounded-[var(--radius-lg)] mx-auto max-w-[210mm] print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 ${marginClasses[settings.margin]} ${fontSizeClasses[settings.fontSize]}`}
      style={{ minHeight: '297mm' }}
    >
      {/* HEADER INFO */}
      {settings.showMetadata && (
        <div className="flex justify-between items-start border-b border-black/30 pb-4 mb-6 print:border-b">
          <div className="flex flex-col gap-1 text-left">
            <span className="font-bold uppercase tracking-wider text-xs">Trường THPT Chuyên KHTN</span>
            <span className="text-xs">Môn: {exam.subject}</span>
            <span className="text-xs">{exam.academicYear} | {exam.semester}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className={`font-bold ${titleFontSizeClasses[settings.fontSize]}`}>ĐỀ THI: {exam.title}</span>
            <span className="text-xs">Thời gian làm bài: {exam.duration} phút</span>
            <span className="text-xs italic">Mã đề: #{exam.id}</span>
          </div>
        </div>
      )}

      {/* STUDENT CARD */}
      {settings.showStudentCard && (
        <div className="border border-black/40 p-4 rounded-[var(--radius-md)] mb-6 flex flex-col sm:flex-row justify-between gap-4 print:flex-row">
          <div className="flex-1 flex gap-2 items-end">
            <span className="font-semibold text-xs whitespace-nowrap">Họ và tên:</span>
            <div className="border-b border-black/40 border-dashed w-full h-4 mb-0.5" />
          </div>
          <div className="flex gap-4">
            <div className="w-24 flex gap-2 items-end">
              <span className="font-semibold text-xs whitespace-nowrap">Lớp:</span>
              <div className="border-b border-black/40 border-dashed w-full h-4 mb-0.5" />
            </div>
            <div className="w-32 flex gap-2 items-end">
              <span className="font-semibold text-xs whitespace-nowrap">SBD:</span>
              <div className="border-b border-black/40 border-dashed w-full h-4 mb-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      {settings.showInstructions && (
        <div className="text-xs italic text-black/80 mb-6 border-l-2 border-black/40 pl-3 py-0.5">
          * Thí sinh làm bài trực tiếp vào tờ đề thi này. Không sử dụng bất kỳ tài liệu nào ngoài bảng tuần hoàn (nếu có). Giám thị coi thi không giải thích gì thêm.
        </div>
      )}

      {/* QUESTIONS */}
      {exam.questions.length === 0 ? (
        <div className="text-center py-12 italic text-black/60">
          Chưa có câu hỏi nào trong đề thi này.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {exam.questions.map((question, index) => {
            const options = (question as any).answers || [
              { id: '1', content: 'Phương án A mock', isCorrect: true },
              { id: '2', content: 'Phương án B mock', isCorrect: false },
              { id: '3', content: 'Phương án C mock', isCorrect: false },
              { id: '4', content: 'Phương án D mock', isCorrect: false },
            ]

            return (
              <div key={question.id} className="flex flex-col gap-2 print:break-inside-avoid">
                <p className="font-semibold leading-relaxed">
                  Câu {index + 1}: <span className="font-normal">{question.content}</span>
                </p>
                <div
                  className={`pl-4 gap-x-6 gap-y-2 ${
                    settings.twoColumnChoices ? 'grid grid-cols-2' : 'flex flex-col'
                  }`}
                >
                  {options.map((opt: any, optIdx: number) => {
                    const letter = String.fromCharCode(65 + optIdx)
                    const isTeacherModeCorrect = settings.mode === 'teacher' && opt.isCorrect

                    return (
                      <div
                        key={opt.id || optIdx}
                        className={`flex items-start gap-2 p-1 rounded transition-colors ${
                          isTeacherModeCorrect
                            ? 'bg-green-50 border border-green-200 font-bold text-green-800 print:bg-transparent print:border-none print:text-black print:underline'
                            : ''
                        }`}
                      >
                        <span className="font-bold">{letter}.</span>
                        <span className="text-black/90">{opt.content}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-12 pt-4 border-t border-black/20 text-xs text-black/60 print:break-inside-avoid">
        <span>Mã đề thi: #{exam.id}</span>
        <span className="font-semibold">HẾT</span>
        <span>Trang 1 / 1</span>
      </div>
    </div>
  )
}
export default ExportPreviewPanel
