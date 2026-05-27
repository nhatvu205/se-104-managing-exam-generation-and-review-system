import { type HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] shadow-sm',
        className,
      )}
      {...props}
    />
  )
}