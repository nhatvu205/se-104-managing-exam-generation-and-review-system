import { questions as mockQuestions } from '../mock/questions.mock'
import type { Question } from '../types/question.types'
import type { QuestionFormValues } from '../schemas/question-form.schema'

// InMemory database simulation
let localQuestions = [...mockQuestions];

export const questionService = {
  getQuestions: async (): Promise<Question[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [...localQuestions]
  },

  getQuestionById: async (id: number): Promise<Question | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return localQuestions.find((q) => q.id === id)
  },

  createQuestion: async (values: QuestionFormValues): Promise<Question> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const newQuestion: Question = {
      id: localQuestions.length ? Math.max(...localQuestions.map((q) => q.id)) + 1 : 1,
      content: values.content,
      subject: values.subject,
      difficulty: values.difficulty,
      status: values.status,
      createdAt: new Date().toISOString().split('T')[0],
      // We can preserve extra fields if required
    }
    localQuestions.push(newQuestion)
    return newQuestion
  },

  updateQuestion: async (id: number, values: QuestionFormValues): Promise<Question> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const idx = localQuestions.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error('Không tìm thấy câu hỏi')
    
    const updated: Question = {
      ...localQuestions[idx],
      content: values.content,
      subject: values.subject,
      difficulty: values.difficulty,
      status: values.status,
    }
    localQuestions[idx] = updated
    return updated
  },
}
