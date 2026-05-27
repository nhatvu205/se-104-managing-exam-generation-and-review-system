import React from 'react'
import { useNavigate } from 'react-router-dom'
import { QuestionForm } from '@/features/question-bank'

export const QuestionFormPage: React.FC = () => {
  const navigate = useNavigate()

  const handleCancel = () => {
    navigate('/questions')
  }

  const handleSuccess = () => {
    navigate('/questions')
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Tạo câu hỏi mới
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Điền các thông tin chi tiết dưới đây để thêm câu hỏi trắc nghiệm mới vào ngân hàng câu hỏi.
        </p>
      </div>

      <QuestionForm
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
export default QuestionFormPage
