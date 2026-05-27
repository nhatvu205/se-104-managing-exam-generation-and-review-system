import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { questionFormSchema, type QuestionFormValues } from '../schemas/question-form.schema'
import { questionService } from '../services/question.service'

const defaultValues: QuestionFormValues = {
  subject: '',
  difficulty: 'easy',
  status: 'draft',
  learningOutcome: '',
  content: '',
  answers: [
    { id: '1', content: '', isCorrect: false },
    { id: '2', content: '', isCorrect: false },
  ],
}

interface UseQuestionFormOptions {
  id?: number
  onSuccess?: () => void
  initialValues?: Partial<QuestionFormValues>
}

export const useQuestionForm = ({ id, onSuccess, initialValues }: UseQuestionFormOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
    mode: 'onChange',
  })

  const { control, handleSubmit } = form
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'answers',
  })

  const handleAddAnswer = () => {
    append({
      id: Date.now().toString(),
      content: '',
      isCorrect: false,
    })
  }

  const handleRemoveAnswer = (index: number) => {
    if (fields.length > 2) {
      remove(index)
    }
  }

  const handleSetCorrectAnswer = (correctIndex: number) => {
    // Single choice correctness - uncheck all others
    fields.forEach((field, idx) => {
      update(idx, {
        ...field,
        isCorrect: idx === correctIndex,
      })
    })
  }

  const onSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (id !== undefined) {
        await questionService.updateQuestion(id, values)
      } else {
        await questionService.createQuestion(values)
      }
      onSuccess?.()
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra khi lưu câu hỏi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    fields,
    handleAddAnswer,
    handleRemoveAnswer,
    handleSetCorrectAnswer,
    onSubmit: handleSubmit(onSubmit),
    isSubmitting,
    submitError,
  }
}
