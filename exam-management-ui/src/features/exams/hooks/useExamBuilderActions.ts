import { useExamBuilderStore } from '../stores/exam-builder.store'

export const useExamBuilderActions = () => {
  const setMetadata = useExamBuilderStore((state) => state.setMetadata)
  const addQuestion = useExamBuilderStore((state) => state.addQuestion)
  const removeQuestion = useExamBuilderStore((state) => state.removeQuestion)
  const reorderQuestions = useExamBuilderStore((state) => state.reorderQuestions)
  const updateQuestionScore = useExamBuilderStore((state) => state.updateQuestionScore)
  const resetBuilder = useExamBuilderStore((state) => state.resetBuilder)

  return {
    setMetadata,
    addQuestion,
    removeQuestion,
    reorderQuestions,
    updateQuestionScore,
    resetBuilder,
  }
}
export default useExamBuilderActions
