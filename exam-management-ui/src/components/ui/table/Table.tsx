import { type HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type TableProps = HTMLAttributes<HTMLDivElement>

export function Table({
  className,
  children,
  ...props
}: TableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-white shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    </div>
  )
}