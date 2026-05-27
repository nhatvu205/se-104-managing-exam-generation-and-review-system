import { Skeleton } from './Skeleton'

export function SkeletonCard() {
  return (
    <div
      className="
        rounded-[var(--radius-lg)]
        border border-[var(--border-primary)]
        bg-white
        p-6
        shadow-sm
      "
    >
      <Skeleton className="h-5 w-32" />

      <Skeleton className="mt-4 h-10 w-24" />

      <Skeleton className="mt-6 h-4 w-full" />
    </div>
  )
}