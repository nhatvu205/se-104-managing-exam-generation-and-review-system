import { Card } from '@/components/ui/card'

import { notifications } from '../mock/dashboard.mock'

export function NotificationPanel() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">
        Thông báo
      </h2>

      <div className="mt-6 space-y-4">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="
              rounded-[var(--radius-md)]
              border border-[var(--border-primary)]
              p-4
            "
          >
            <h3 className="font-medium">
              {item.title}
            </h3>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {item.description}
            </p>

            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {item.createdAt}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}