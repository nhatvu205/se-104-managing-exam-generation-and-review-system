import type { SelectedQuestion } from '../types/exam-builder.types'

export const validateLoCoverage = (
  selectedQuestions: SelectedQuestion[]
): {
  coveredLos: string[]
  coveragePercent: number
  isValid: boolean
} => {
  // Extract all learning outcomes. Note: Question interface does not have learningOutcome in the basic Question interface, 
  // but it's part of our builder model, so we can mock/read from values or map subject standards.
  // We'll read from `question.subject` or mock LO based on question id for this demo.
  const mockLOs = selectedQuestions.map((q) => {
    // If it has learningOutcome, read it; otherwise mock a standard LO
    return (q.question as any).learningOutcome || `LO-${q.question.id % 3 + 1}`
  })

  const uniqueLos = Array.from(new Set(mockLOs)).filter(Boolean)
  const totalExpectedLos = 4 // standard baseline
  const coveragePercent = Math.min(100, Math.round((uniqueLos.length / totalExpectedLos) * 100))

  return {
    coveredLos: uniqueLos,
    coveragePercent,
    isValid: uniqueLos.length >= 2, // Must cover at least 2 different learning outcomes
  }
}
export default validateLoCoverage
