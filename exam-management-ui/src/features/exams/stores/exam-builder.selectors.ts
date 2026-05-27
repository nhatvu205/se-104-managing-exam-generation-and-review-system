import { validateTotalScore } from '../utils/validate-total-score'
import { validateQuestionCount } from '../utils/validate-question-count'
import { validateLoCoverage } from '../utils/validate-lo-coverage'
import type { SelectedQuestion, BuilderValidationResult } from '../types/exam-builder.types'

export const selectTotalScoreInfo = (selectedQuestions: SelectedQuestion[]) => {
  return validateTotalScore(selectedQuestions)
}

export const selectQuestionCountInfo = (selectedQuestions: SelectedQuestion[]) => {
  return validateQuestionCount(selectedQuestions)
}

export const selectLoCoverageInfo = (selectedQuestions: SelectedQuestion[]) => {
  return validateLoCoverage(selectedQuestions)
}

export const selectBuilderValidation = (
  selectedQuestions: SelectedQuestion[]
): BuilderValidationResult => {
  const scoreInfo = validateTotalScore(selectedQuestions)
  const countInfo = validateQuestionCount(selectedQuestions)
  const loInfo = validateLoCoverage(selectedQuestions)

  const errors: string[] = []
  if (!scoreInfo.isValid) {
    errors.push(`Tổng điểm hiện tại là ${scoreInfo.total}/10. Điểm số của đề thi bắt buộc phải bằng 10.`)
  }
  if (!countInfo.isValid) {
    errors.push(`Số lượng câu hỏi là ${countInfo.count} câu. Yêu cầu có từ 5 đến 25 câu hỏi.`)
  }
  if (!loInfo.isValid) {
    errors.push(`Số lượng chuẩn đầu ra (LO) được bao phủ là ${loInfo.coveredLos.length}. Yêu cầu phủ tối thiểu 2 chuẩn đầu ra.`)
  }

  return {
    totalScore: scoreInfo.total,
    isValidScore: scoreInfo.isValid,
    questionCount: countInfo.count,
    isValidQuestionCount: countInfo.isValid,
    loCoveragePercent: loInfo.coveragePercent,
    isValidLoCoverage: loInfo.isValid,
    errors,
  }
}
