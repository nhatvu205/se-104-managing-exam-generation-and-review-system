import type { SelectedQuestion } from '../types/exam-builder.types'

export const validateQuestionCount = (selectedQuestions: SelectedQuestion[]): {
  count: number
  isValid: boolean
} => {
  const count = selectedQuestions.length
  return {
    count,
    isValid: count >= 5 && count <= 25, // Mock standard limits e.g., between 5 and 25 questions
  }
}
export default validateQuestionCount
