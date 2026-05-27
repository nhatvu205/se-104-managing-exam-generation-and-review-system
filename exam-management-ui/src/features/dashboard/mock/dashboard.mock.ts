import type {
  DashboardStats,
  NotificationItem,
  RecentExam,
} from '../types/dashboard.types'

export const dashboardStats: DashboardStats = {
  totalQuestions: 128,
  totalExams: 24,
  pendingGradings: 12,
  pendingAppeals: 3,
}

export const recentExams: RecentExam[] = [
  {
    id: 1,
    title: 'Đề thi ReactJS giữa kỳ',
    subject: 'Lập trình Web',
    status: 'approved',
    createdAt: '2026-05-20',
  },
  {
    id: 2,
    title: 'Đề thi TypeScript',
    subject: 'Frontend nâng cao',
    status: 'draft',
    createdAt: '2026-05-18',
  },
]

export const notifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Có yêu cầu phúc khảo mới',
    description: 'Nguyễn Văn A đã gửi yêu cầu phúc khảo.',
    createdAt: '5 phút trước',
  },
  {
    id: 2,
    title: 'Đề thi đã được duyệt',
    description: 'Đề thi ReactJS giữa kỳ đã được duyệt.',
    createdAt: '1 giờ trước',
  },
]