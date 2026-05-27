import { type HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>

export function TableHead({ 
  className,
  ...props
}: TableHeadProps) {
  return (
    <thead
      className={cn(
        'sticky top-0 z-10 bg-[var(--surface-secondary)]',
        className,
      )}
      {...props}
    />
  )
}