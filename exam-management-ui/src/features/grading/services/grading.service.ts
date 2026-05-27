import type { GradingRecord } from '../types/grading.types'

const initialGradingRecords: GradingRecord[] = [
  {
    id: 1,
    studentName: 'Nguyễn Văn Bình',
    studentId: 'SV001',
    examId: 101,
    examTitle: 'Đề thi giữa kỳ Lập trình Web',
    status: 'ungraded',
    totalScore: 0,
    maxScore: 10,
    startedAt: '2026-05-26T08:00:00Z',
    submittedAt: '2026-05-26T09:30:00Z',
    answers: [
      {
        questionId: 1,
        studentAnswer: 'Phương án A mock',
        score: 0,
        maxScore: 10,
        feedback: '',
        isCorrect: false,
      },
    ],
  },
  {
    id: 2,
    studentName: 'Trần Thị Hoa',
    studentId: 'SV002',
    examId: 101,
    examTitle: 'Đề thi giữa kỳ Lập trình Web',
    status: 'grading',
    totalScore: 5,
    maxScore: 10,
    startedAt: '2026-05-26T08:00:00Z',
    submittedAt: '2026-05-26T09:25:00Z',
    answers: [
      {
        questionId: 1,
        studentAnswer: 'Phương án B mock',
        score: 5,
        maxScore: 10,
        feedback: 'Đáp án gần đúng nhưng thiếu ý phụ',
        isCorrect: false,
      },
    ],
  },
  {
    id: 3,
    studentName: 'Lê Văn Đạt',
    studentId: 'SV003',
    examId: 101,
    examTitle: 'Đề thi giữa kỳ Lập trình Web',
    status: 'graded',
    totalScore: 8.5,
    maxScore: 10,
    startedAt: '2026-05-26T08:00:00Z',
    submittedAt: '2026-05-26T09:20:00Z',
    gradedAt: '2026-05-26T14:30:00Z',
    graderName: 'Nguyễn Văn A',
    answers: [
      {
        questionId: 1,
        studentAnswer: 'Phương án A mock',
        score: 8.5,
        maxScore: 10,
        feedback: 'Trình bày tốt, thuật toán tối ưu',
        isCorrect: true,
      },
    ],
  },
  {
    id: 4,
    studentName: 'Phạm Hồng Hải',
    studentId: 'SV004',
    examId: 103,
    examTitle: 'Đề thi cuối kỳ Frontend nâng cao',
    status: 'published',
    totalScore: 9.0,
    maxScore: 10,
    startedAt: '2026-05-25T13:00:00Z',
    submittedAt: '2026-05-25T15:00:00Z',
    gradedAt: '2026-05-25T17:30:00Z',
    graderName: 'Trần Thị B',
    answers: [
      {
        questionId: 2,
        studentAnswer: 'Phương án A mock',
        score: 9.0,
        maxScore: 10,
        feedback: 'Excellent design structure',
        isCorrect: true,
      },
    ],
  },
]

let localRecords = [...initialGradingRecords]

export const gradingService = {
  getGradingRecords: async (): Promise<GradingRecord[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...localRecords]
  },

  getGradingRecordById: async (id: number): Promise<GradingRecord | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return localRecords.find((r) => r.id === id)
  },

  updateGradingRecord: async (
    id: number,
    record: Partial<GradingRecord>
  ): Promise<GradingRecord | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const index = localRecords.findIndex((r) => r.id === id)
    if (index !== -1) {
      localRecords[index] = {
        ...localRecords[index],
        ...record,
      }
      return localRecords[index]
    }
    return undefined
  },
}
export default gradingService
