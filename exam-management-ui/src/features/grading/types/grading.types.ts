export type GradingStatus = 'ungraded' | 'grading' | 'graded' | 'published'

export interface StudentAnswer {
  questionId: number
  studentAnswer: string
  score: number
  maxScore: number
  feedback?: string
  isCorrect?: boolean
}

export interface LOCoverageGrading {
  loCode: string
  score: number
  maxScore: number
}

export interface GradingRecord {
  id: number
  studentName: string
  studentId: string
  examId: number
  examTitle: string
  status: GradingStatus
  totalScore: number
  maxScore: number
  startedAt: string
  submittedAt: string
  gradedAt?: string
  graderName?: string
  answers: StudentAnswer[]
  loCoverage?: LOCoverageGrading[]
}
