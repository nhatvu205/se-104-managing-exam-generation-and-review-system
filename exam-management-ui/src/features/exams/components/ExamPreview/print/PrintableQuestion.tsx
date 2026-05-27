import React from 'react'
import type { Question } from '@/features/question-bank/types/question.types'
import type { PreviewMode } from '../toolbar/PrintToolbar'

interface PrintableQuestionProps {
  question: Question
  index: number
  mode: PreviewMode
}

export const PrintableQuestion: React.FC<PrintableQuestionProps> = ({
  question,
  index,
  mode,
}) => {
  // Use custom answers if saved; otherwise fall back to standard mock answers
  const options = (question as any).answers || [
    { id: '1', content: 'Phương án A mock', isCorrect: true },
    { id: '2', content: 'Phương án B mock', isCorrect: false },
    { id: '3', content: 'Phương án C mock', isCorrect: false },
    { id: '4', content: 'Phương án D mock', isCorrect: false },
  ]

  return (
    <div className="printable-question-card text-black font-serif flex flex-col gap-3">
      {/* Question header */}
      <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">
        <span>Câu {index + 1}: </span>
        {question.content}
      </p>

      {/* Answers Options Grid */}
      <div className="printable-answers-grid grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 pl-4">
        {options.map((option: any, idx: number) => {
          const letter = String.fromCharCode(65 + idx)
          const isCorrect = option.isCorrect && mode === 'teacher'

          return (
            <div
              key={option.id || idx}
              className={`flex items-start gap-2 p-1.5 rounded-[var(--radius-sm)] transition-all ${
                isCorrect
                  ? 'bg-green-50 border border-green-300 font-bold text-green-800'
                  : ''
              }`}
            >
              <span className="font-semibold">{letter}.</span>
              <span className="text-xs leading-normal">{option.content}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default PrintableQuestion
