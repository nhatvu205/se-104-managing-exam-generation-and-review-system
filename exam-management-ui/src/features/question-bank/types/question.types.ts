export type QuestionDifficulty =
  | 'easy'
  | 'medium'
  | 'hard'

export type QuestionStatus =
  | 'draft'
  | 'complete'
  | 'flagged'
  | 'error'

export interface Question {
  id: number

  content: string

  subject: string

  difficulty: QuestionDifficulty

  status: QuestionStatus

  createdAt: string
}