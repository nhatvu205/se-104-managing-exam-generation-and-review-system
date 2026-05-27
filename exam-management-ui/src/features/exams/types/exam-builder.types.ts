import type { Question } from '@/features/question-bank/types/question.types'

export interface ExamMetadata {
  title: string
  description: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: number
  academicYear: string
  semester: string
}

export interface SelectedQuestion {
  question: Question
  score: number // score for this question
  order: number
}

export interface BuilderValidationResult {
  totalScore: number
  isValidScore: boolean
  questionCount: number
  isValidQuestionCount: boolean
  loCoveragePercent: number
  isValidLoCoverage: boolean
  errors: string[]
}
