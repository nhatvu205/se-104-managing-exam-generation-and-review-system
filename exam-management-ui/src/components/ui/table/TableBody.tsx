import { type HTMLAttributes } from 'react'

type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

export function TableBody(props: TableBodyProps) {
  return <tbody {...props} />
}