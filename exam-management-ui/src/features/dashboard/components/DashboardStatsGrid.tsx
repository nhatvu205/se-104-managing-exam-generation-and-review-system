import {
  ClipboardCheck,
  FileQuestion,
  FileText,
  Flag,
} from 'lucide-react'

import { StatsCard } from './StatsCard'

import { dashboardStats } from '../mock/dashboard.mock'

export function DashboardStatsGrid() {
  return (
    <div
      className="
        grid grid-cols-1 gap-6
        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      <StatsCard
        title="Câu hỏi"
        value={dashboardStats.totalQuestions}
        icon={<FileQuestion size={22} />}
      />

      <StatsCard
        title="Đề thi"
        value={dashboardStats.totalExams}
        icon={<FileText size={22} />}
      />

      <StatsCard
        title="Bài cần chấm"
        value={dashboardStats.pendingGradings}
        icon={<ClipboardCheck size={22} />}
      />

      <StatsCard
        title="Phúc khảo"
        value={dashboardStats.pendingAppeals}
        icon={<Flag size={22} />}
      />
    </div>
  )
}