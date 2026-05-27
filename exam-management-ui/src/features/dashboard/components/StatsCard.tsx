import { type ReactNode } from 'react'

import { Card } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: number
  icon: ReactNode
  description?: string
}

export function StatsCard({
  title,
  value,
  icon,
  description,
}: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {value}
          </h3>
        </div>

        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-[var(--radius-md)]
            bg-[var(--accent-soft)]
            text-[var(--accent-primary)]
          "
        >
          {icon}
        </div>
      </div>

      {description && (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          {description}
        </p>
      )}
    </Card>
  )
}