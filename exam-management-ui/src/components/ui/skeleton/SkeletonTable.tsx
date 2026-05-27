import { Skeleton } from './Skeleton'

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
}: SkeletonTableProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-[var(--radius-lg)]
        border border-[var(--border-primary)]
        bg-white
      "
    >
      <div className="border-b border-[var(--border-primary)] p-4">
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="divide-y divide-[var(--border-primary)]">
        {Array.from({ length: rows }).map(
          (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-5 gap-4 p-4"
            >
              {Array.from({
                length: columns,
              }).map((_, columnIndex) => (
                <Skeleton
                  key={columnIndex}
                  className="h-4 w-full"
                />
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  )
}