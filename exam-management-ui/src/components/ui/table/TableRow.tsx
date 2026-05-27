import { type HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type TableRowProps = HTMLAttributes<HTMLTableRowElement>

export function TableRow({
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--border-primary)] transition-colors duration-200 hover:bg-[var(--surface-secondary)]',
        className,
      )}
      {...props}
    />
  )
}