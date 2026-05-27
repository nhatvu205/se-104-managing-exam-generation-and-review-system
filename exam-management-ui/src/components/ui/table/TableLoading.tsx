interface TableLoadingProps {
  rows?: number
  columns?: number
}

export function TableLoading({
  rows = 5,
  columns = 5,
}: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b border-[var(--border-primary)]"
        >
          {Array.from({ length: columns }).map(
            (_, columnIndex) => (
              <td
                key={columnIndex}
                className="px-4 py-4"
              >
                <div className="h-4 animate-pulse rounded bg-[var(--bg-secondary)]" />
              </td>
            ),
          )}
        </tr>
      ))}
    </>
  )
}