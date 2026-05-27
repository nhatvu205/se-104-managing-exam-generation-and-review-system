import { FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export function QuestionEmptyState() {
  return (
    <EmptyState
      icon={<FileQuestion size={24} />}
      title="Chưa có câu hỏi nào"
      description="Bạn chưa tạo câu hỏi nào trong ngân hàng câu hỏi."
      action={
        <Button>
          Tạo câu hỏi mới
        </Button>
      }
    />
  )
}