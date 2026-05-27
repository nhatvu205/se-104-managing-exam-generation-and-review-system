import { create } from 'zustand'
import type { GradingRecord } from '../types/grading.types'
import { gradingService } from '../services/grading.service'

interface GradingDetailState {
  record: GradingRecord | null
  loading: boolean
  error: string | null
  isDirty: boolean
  draftUpdatedAt: string | null

  // Actions
  loadRecord: (id: number) => Promise<void>
  updateAnswerScore: (questionId: number, score: number) => void
  updateAnswerFeedback: (questionId: number, feedback: string) => void
  saveDraft: () => Promise<void>
  publishGrades: () => Promise<void>
}

export const useGradingDetailStore = create<GradingDetailState>((set, get) => ({
  record: null,
  loading: false,
  error: null,
  isDirty: false,
  draftUpdatedAt: null,

  loadRecord: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const data = await gradingService.getGradingRecordById(id)
      if (data) {
        set({ record: data, isDirty: false, draftUpdatedAt: null })
      } else {
        set({ error: 'Không tìm thấy hồ sơ chấm điểm' })
      }
    } catch (err: any) {
      set({ error: err?.message || 'Có lỗi xảy ra khi tải dữ liệu chấm điểm' })
    } finally {
      set({ loading: false })
    }
  },

  updateAnswerScore: (questionId: number, score: number) => {
    const { record } = get()
    if (!record) return

    const updatedAnswers = record.answers.map((ans) => {
      if (ans.questionId === questionId) {
        return {
          ...ans,
          score: Math.min(score, ans.maxScore),
        }
      }
      return ans
    })

    const totalScore = updatedAnswers.reduce((sum, a) => sum + a.score, 0)

    set({
      record: {
        ...record,
        answers: updatedAnswers,
        totalScore,
        status: record.status === 'ungraded' ? 'grading' : record.status,
      },
      isDirty: true,
      draftUpdatedAt: new Date().toISOString(),
    })
  },

  updateAnswerFeedback: (questionId: number, feedback: string) => {
    const { record } = get()
    if (!record) return

    const updatedAnswers = record.answers.map((ans) => {
      if (ans.questionId === questionId) {
        return {
          ...ans,
          feedback,
        }
      }
      return ans
    })

    set({
      record: {
        ...record,
        answers: updatedAnswers,
        status: record.status === 'ungraded' ? 'grading' : record.status,
      },
      isDirty: true,
      draftUpdatedAt: new Date().toISOString(),
    })
  },

  saveDraft: async () => {
    const { record } = get()
    if (!record) return

    set({ loading: true })
    try {
      const updated = await gradingService.updateGradingRecord(record.id, {
        answers: record.answers,
        totalScore: record.totalScore,
        status: 'grading',
      })
      if (updated) {
        set({
          record: updated,
          isDirty: false,
          draftUpdatedAt: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      set({ error: err?.message || 'Không thể lưu bản nháp' })
    } finally {
      set({ loading: false })
    }
  },

  publishGrades: async () => {
    const { record } = get()
    if (!record) return

    set({ loading: true })
    try {
      const updated = await gradingService.updateGradingRecord(record.id, {
        answers: record.answers,
        totalScore: record.totalScore,
        status: 'published',
        gradedAt: new Date().toISOString().split('T')[0],
        graderName: 'Giáo viên hiện tại',
      })
      if (updated) {
        set({
          record: updated,
          isDirty: false,
          draftUpdatedAt: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      set({ error: err?.message || 'Không thể công bố điểm' })
    } finally {
      set({ loading: false })
    }
  },
}))

// Memoized Selectors
export const selectTotalScore = (state: GradingDetailState) => state.record?.totalScore || 0
export const selectMaxScore = (state: GradingDetailState) => state.record?.maxScore || 10
export const selectAnswers = (state: GradingDetailState) => state.record?.answers || []
export const selectGradingStatus = (state: GradingDetailState) => state.record?.status || 'ungraded'

export const selectGradedCount = (state: GradingDetailState) => {
  const answers = state.record?.answers || []
  return answers.filter((a) => a.score > 0 || (a.feedback && a.feedback.trim() !== '')).length
}

export const selectUngradedCount = (state: GradingDetailState) => {
  const answers = state.record?.answers || []
  const gradedCount = answers.filter((a) => a.score > 0 || (a.feedback && a.feedback.trim() !== '')).length
  return answers.length - gradedCount
}
