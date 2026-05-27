import { useMemo } from 'react'
import { useExamBuilderStore } from '../stores/exam-builder.store'
import { selectBuilderValidation } from '../stores/exam-builder.selectors'
import type { BuilderValidationResult } from '../types/exam-builder.types'

export const useExamValidation = (): BuilderValidationResult => {
  const selectedQuestions = useExamBuilderStore((state) => state.selectedQuestions)

  return useMemo(() => {
    return selectBuilderValidation(selectedQuestions)
  }, [selectedQuestions])
}
export default useExamValidation
