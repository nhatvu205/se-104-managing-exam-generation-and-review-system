import { type HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

import { badgeVariants } from './badge.config'

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

export function Badge({
  className,
  variant = 'neutral',
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}