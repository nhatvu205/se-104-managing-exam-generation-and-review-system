import type { Question } from '../types/question.types'

export const questions: Question[] = [
  {
    id: 1,
    content: 'React là gì?',
    subject: 'Lập trình Web',
    difficulty: 'easy',
    status: 'complete',
    createdAt: '2026-05-20',
  },
  {
    id: 2,
    content: 'Giải thích Virtual DOM',
    subject: 'Frontend nâng cao',
    difficulty: 'medium',
    status: 'draft',
    createdAt: '2026-05-18',
  },
  {
    id: 3,
    content: 'REST API hoạt động như thế nào?',
    subject: 'Backend',
    difficulty: 'hard',
    status: 'flagged',
    createdAt: '2026-05-15',
  },
]