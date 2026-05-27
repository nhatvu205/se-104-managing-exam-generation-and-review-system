import { useExamBuilderStore } from '../stores/exam-builder.store'

export const useExamBuilderState = () => {
  const metadata = useExamBuilderStore((state) => state.metadata)
  const selectedQuestions = useExamBuilderStore((state) => state.selectedQuestions)

  return {
    metadata,
    selectedQuestions,
  }
}
export default useExamBuilderState
