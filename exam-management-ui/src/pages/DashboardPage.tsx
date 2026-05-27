import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid'
import { NotificationPanel } from '@/features/dashboard/components/NotificationPanel'
import { RecentExamTable } from '@/features/dashboard/components/RecentExamTable'

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <DashboardStatsGrid />

      <div
        className="
          grid grid-cols-1 gap-6
          xl:grid-cols-3
        "
      >
        <div className="xl:col-span-2">
          <RecentExamTable />
        </div>

        <NotificationPanel />
      </div>
    </div>
  )
}