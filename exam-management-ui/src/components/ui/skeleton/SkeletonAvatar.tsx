import { Skeleton } from './Skeleton'

interface SkeletonAvatarProps {
  size?: number
}

export function SkeletonAvatar({
  size = 40,
}: SkeletonAvatarProps) {
  return (
    <Skeleton
      className="rounded-full"
      style={{
        width: size,
        height: size,
      }}
    />
  )
}