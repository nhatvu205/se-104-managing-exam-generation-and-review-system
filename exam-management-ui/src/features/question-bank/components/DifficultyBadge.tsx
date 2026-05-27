import { Badge } from '@/components/ui/badge'

type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

const difficultyMap = {
  easy: {
    label: 'Dễ',
    variant: 'success' as const,
  },

  medium: {
    label: 'Trung bình',
    variant: 'warning' as const,
  },

  hard: {
    label: 'Khó',
    variant: 'danger' as const,
  },
}

export function DifficultyBadge({
  difficulty,
}: DifficultyBadgeProps) {
  const config = difficultyMap[difficulty]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}