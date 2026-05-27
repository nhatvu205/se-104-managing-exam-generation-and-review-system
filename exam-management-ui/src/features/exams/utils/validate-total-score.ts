import type { SelectedQuestion } from '../types/exam-builder.types'

export const validateTotalScore = (selectedQuestions: SelectedQuestion[]): {
  total: number
  isValid: boolean
} => {
  const total = selectedQuestions.reduce((acc, q) => acc + q.score, 0)
  // Float precision handling
  const rounded = Math.round(total * 100) / 100
  return {
    total: rounded,
    isValid: rounded === 10.0,
  }
}
