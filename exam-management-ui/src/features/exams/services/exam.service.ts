import type { Exam } from '../types/exam.types'
import { questions as mockQuestions } from '@/features/question-bank/mock/questions.mock'

const initialExams: Exam[] = [
  {
    id: 101,
    title: 'Đề thi giữa kỳ Lập trình Web',
    subject: 'Lập trình Web',
    difficulty: 'medium',
    duration: 90,
    status: 'published',
    questions: [mockQuestions[0]],
    createdAt: '2026-05-25',
    author: 'Nguyễn Văn A',
    academicYear: '2025-2026',
    semester: 'Học kỳ I',
  },
  {
    id: 102,
    title: 'Đề kiểm tra 15 phút Cơ sở dữ liệu',
    subject: 'Cơ sở dữ liệu',
    difficulty: 'easy',
    duration: 15,
    status: 'draft',
    questions: [],
    createdAt: '2026-05-24',
    author: 'Trần Thị B',
    academicYear: '2025-2026',
    semester: 'Học kỳ I',
  },
  {
    id: 103,
    title: 'Đề thi cuối kỳ Frontend nâng cao',
    subject: 'Frontend nâng cao',
    difficulty: 'hard',
    duration: 120,
    status: 'approved',
    questions: [mockQuestions[1]],
    createdAt: '2026-05-22',
    author: 'Nguyễn Văn A',
    academicYear: '2025-2026',
    semester: 'Học kỳ II',
  },
  {
    id: 104,
    title: 'Đề thi cũ Backend nâng cao 2024',
    subject: 'Backend',
    difficulty: 'hard',
    duration: 90,
    status: 'archived',
    questions: [mockQuestions[2]],
    createdAt: '2025-12-10',
    author: 'Lê Văn C',
    academicYear: '2024-2025',
    semester: 'Học kỳ II',
  },
]

let localExams = [...initialExams]

export const examService = {
  getExams: async (): Promise<Exam[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [...localExams]
  },

  getExamById: async (id: number): Promise<Exam | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return localExams.find((e) => e.id === id)
  },

  createExam: async (exam: Omit<Exam, 'id' | 'createdAt'>): Promise<Exam> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const newExam: Exam = {
      ...exam,
      id: localExams.length ? Math.max(...localExams.map((e) => e.id)) + 1 : 101,
      createdAt: new Date().toISOString().split('T')[0],
    }
    localExams.unshift(newExam)
    return newExam
  },

  deleteExam: async (id: number): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const initialLen = localExams.length
    localExams = localExams.filter((e) => e.id !== id)
    return localExams.length < initialLen
  },
}
export default examService
