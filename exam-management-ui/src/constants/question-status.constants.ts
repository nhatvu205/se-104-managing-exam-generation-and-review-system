export const QUESTION_STATUSES = {
  DRAFT: 'draft',
  COMPLETE: 'complete',
  FLAGGED: 'flagged',
  ERROR: 'error',
} as const;

export type QuestionStatus = typeof QUESTION_STATUSES[keyof typeof QUESTION_STATUSES];

export const QUESTION_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type QuestionDifficulty = typeof QUESTION_DIFFICULTIES[keyof typeof QUESTION_DIFFICULTIES];
