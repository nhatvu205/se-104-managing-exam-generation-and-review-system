export const EXAM_STATUSES = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type ExamStatus = typeof EXAM_STATUSES[keyof typeof EXAM_STATUSES];
