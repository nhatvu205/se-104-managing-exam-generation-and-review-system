import type { Question } from '@/features/question-bank/types/question.types'

export type ExamStatus = 'draft' | 'approved' | 'published' | 'archived'

export interface Exam {
  id: number
  title: string
  description?: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: number // in minutes
  status: ExamStatus
  questions: Question[]
  createdAt: string
  author: string
  academicYear: string
  semester: string
}
