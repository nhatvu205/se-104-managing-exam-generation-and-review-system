interface TableEmptyProps {
  colSpan: number
  title?: string
  description?: string
}

export function TableEmpty({
  colSpan,
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có dữ liệu để hiển thị.',
}: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-12 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-medium text-[var(--text-primary)]">
            {title}
          </p>

          <p className="text-sm text-[var(--text-muted)]">
            {description}
          </p>
        </div>
      </td>
    </tr>
  )
}