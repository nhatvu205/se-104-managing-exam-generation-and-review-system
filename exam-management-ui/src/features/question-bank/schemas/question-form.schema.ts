import { z } from 'zod'

export const answerOptionSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Nội dung câu trả lời không được để trống'),
  isCorrect: z.boolean(),
})

export const questionFormSchema = z.object({
  subject: z.string().min(1, 'Vui lòng chọn môn học'),
  difficulty: z.enum(['easy', 'medium', 'hard'], 'Vui lòng chọn độ khó'),
  status: z.enum(['draft', 'complete', 'flagged', 'error'], 'Vui lòng chọn trạng thái'),
  learningOutcome: z.string().min(1, 'Vui lòng chọn chuẩn đầu ra (LO)'),
  content: z.string().min(10, 'Nội dung câu hỏi phải có ít nhất 10 ký tự'),
  answers: z
    .array(answerOptionSchema)
    .min(2, 'Phải có ít nhất 2 câu trả lời')
    .refine(
      (answers) => answers.some((ans) => ans.isCorrect),
      'Phải chọn ít nhất một đáp án đúng'
    ),
})

export type QuestionFormValues = z.infer<typeof questionFormSchema>
export type AnswerOptionValues = z.infer<typeof answerOptionSchema>
