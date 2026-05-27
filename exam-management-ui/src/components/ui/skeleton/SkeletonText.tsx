import { Skeleton } from './Skeleton'

interface SkeletonTextProps {
  lines?: number
}

export function SkeletonText({
  lines = 3,
}: SkeletonTextProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map(
        (_, index) => (
          <Skeleton
            key={index}
            className="
              h-4
              w-full
              last:w-2/3
            "
          />
        ),
      )}
    </div>
  )
}