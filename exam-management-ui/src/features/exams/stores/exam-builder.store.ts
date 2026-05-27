import { create } from 'zustand'
import type { Question } from '@/features/question-bank/types/question.types'
import type { SelectedQuestion, ExamMetadata } from '../types/exam-builder.types'

interface ExamBuilderState {
  metadata: ExamMetadata
  selectedQuestions: SelectedQuestion[]
  
  // Actions
  setMetadata: (metadata: Partial<ExamMetadata>) => void
  addQuestion: (question: Question) => void
  removeQuestion: (questionId: number) => void
  reorderQuestions: (selectedQuestions: SelectedQuestion[]) => void
  updateQuestionScore: (questionId: number, score: number) => void
  resetBuilder: () => void
}

const initialMetadata: ExamMetadata = {
  title: '',
  description: '',
  subject: '',
  difficulty: 'medium',
  duration: 90,
  academicYear: '2025-2026',
  semester: 'Học kỳ I',
}

export const useExamBuilderStore = create<ExamBuilderState>((set) => ({
  metadata: initialMetadata,
  selectedQuestions: [],

  setMetadata: (updates) =>
    set((state) => ({
      metadata: { ...state.metadata, ...updates },
    })),

  addQuestion: (question) =>
    set((state) => {
      const exists = state.selectedQuestions.some((q) => q.question.id === question.id)
      if (exists) return {} // avoid duplicate additions

      // Default score is 1, order is length + 1
      const newSelected: SelectedQuestion = {
        question,
        score: 1.0,
        order: state.selectedQuestions.length + 1,
      }
      return {
        selectedQuestions: [...state.selectedQuestions, newSelected],
      }
    }),

  removeQuestion: (questionId) =>
    set((state) => {
      const filtered = state.selectedQuestions.filter((q) => q.question.id !== questionId)
      // Re-index orders to be contiguous 1-indexed
      const reindexed = filtered.map((sq, idx) => ({
        ...sq,
        order: idx + 1,
      }))
      return {
        selectedQuestions: reindexed,
      }
    }),

  reorderQuestions: (reordered) =>
    set(() => ({
      selectedQuestions: reordered.map((sq, idx) => ({
        ...sq,
        order: idx + 1,
      })),
    })),

  updateQuestionScore: (questionId, score) =>
    set((state) => ({
      selectedQuestions: state.selectedQuestions.map((q) =>
        q.question.id === questionId ? { ...q, score } : q
      ),
    })),

  resetBuilder: () =>
    set(() => ({
      metadata: initialMetadata,
      selectedQuestions: [],
    })),
}))
