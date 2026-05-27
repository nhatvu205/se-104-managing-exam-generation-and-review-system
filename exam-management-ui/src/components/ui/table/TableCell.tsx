import {
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'

import { cn } from '@/utils/cn'

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  isHeader?: boolean
}

export function TableCell({
  className,
  isHeader = false,
  ...props
}: TableCellProps) {
  if (isHeader) {
    return (
      <th
        className={cn(
          'h-12 px-4 text-left text-sm font-semibold text-[var(--text-primary)]',
          className,
        )}
        {...(props as ThHTMLAttributes<HTMLTableCellElement>)}
      />
    )
  }

  return (
    <td
      className={cn(
        'h-12 px-4 text-sm text-[var(--text-secondary)]',
        className,
      )}
      {...props}
    />
  )
}