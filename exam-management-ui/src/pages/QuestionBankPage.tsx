import { questions } from '@/features/question-bank/mock/questions.mock'

import { QuestionCard } from '@/features/question-bank/components/QuestionCard'
import { QuestionFilterBar } from '@/features/question-bank/components/QuestionFilterBar'
import { QuestionTable } from '@/features/question-bank/components/QuestionTable'

export function QuestionBankPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Ngân hàng câu hỏi
        </h1>

        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Quản lý toàn bộ câu hỏi của bạn.
        </p>
      </div>

      <QuestionFilterBar />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <QuestionTable />
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
          />
        ))}
      </div>
    </div>
  )
}