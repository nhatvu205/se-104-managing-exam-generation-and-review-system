export interface DashboardStats {
  totalQuestions: number
  totalExams: number
  pendingGradings: number
  pendingAppeals: number
}

export interface RecentExam {
  id: number
  title: string
  subject: string
  status: 'draft' | 'approved'
  createdAt: string
}

export interface NotificationItem {
  id: number
  title: string
  description: string
  createdAt: string
}