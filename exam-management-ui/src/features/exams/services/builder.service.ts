import { examService } from './exam.service'
import type { Exam } from '../types/exam.types'
import type { SelectedQuestion, ExamMetadata } from '../types/exam-builder.types'

export const builderService = {
  saveExam: async (metadata: ExamMetadata, selectedQuestions: SelectedQuestion[]): Promise<Exam> => {
    // Transform selected questions to plain questions array for storage
    const questions = selectedQuestions
      .sort((a, b) => a.order - b.order)
      .map((sq) => sq.question)

    const payload: Omit<Exam, 'id' | 'createdAt'> = {
      title: metadata.title,
      description: metadata.description,
      subject: metadata.subject,
      difficulty: metadata.difficulty,
      duration: metadata.duration,
      status: 'draft', // defaults to draft upon creation in builder
      questions,
      author: 'Nguyễn Văn A', // mock author
      academicYear: metadata.academicYear,
      semester: metadata.semester,
    }

    return examService.createExam(payload)
  },
}
export default builderService
