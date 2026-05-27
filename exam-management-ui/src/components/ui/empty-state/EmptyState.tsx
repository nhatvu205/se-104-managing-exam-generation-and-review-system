import { type ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: ReactNode

  title: string

  description?: string

  action?: ReactNode

  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-primary)] bg-[var(--surface-primary)] px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div
          className="
            mb-4
            flex h-14 w-14 items-center justify-center
            rounded-full
            bg-[var(--surface-secondary)]
            text-[var(--text-muted)]
          "
        >
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      {description && (
        <p
          className="
            mt-2
            max-w-md
            text-sm
            leading-6
            text-[var(--text-muted)]
          "
        >
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}