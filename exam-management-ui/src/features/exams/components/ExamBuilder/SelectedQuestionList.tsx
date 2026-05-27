import React, { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge/Badge'
import type { SelectedQuestion } from '../../types/exam-builder.types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

// MEMOIZED SORTABLE ITEM
interface SortableQuestionItemProps {
  sq: SelectedQuestion
  index: number
  onRemove: (id: number) => void
}

const SortableQuestionItem = React.memo<SortableQuestionItemProps>(({ sq, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sq.question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border border-[var(--border-primary)] rounded-[var(--radius-md)] shadow-sm hover:border-[var(--accent-primary)]/50 transition-all duration-200"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-secondary)]"
        aria-label={`Kéo thả để sắp xếp câu hỏi ${index + 1}`}
      >
        <GripVertical className="h-4.5 w-4.5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-bold text-[var(--text-muted)]">
            CÂU {index + 1}
          </span>
          <Badge variant="info">{sq.question.subject}</Badge>
          <Badge
            variant={
              sq.question.difficulty === 'easy'
                ? 'success'
                : sq.question.difficulty === 'medium'
                  ? 'warning'
                  : 'danger'
            }
          >
            {sq.question.difficulty === 'easy' ? 'Dễ' : sq.question.difficulty === 'medium' ? 'TB' : 'Khó'}
          </Badge>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--warning-bg)] text-[var(--warning)] ml-auto">
            {sq.score} điểm
          </span>
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed truncate">
          {sq.question.content}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(sq.question.id)}
        className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]/20 transition-all"
        aria-label={`Xóa câu hỏi ${index + 1}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
})

SortableQuestionItem.displayName = 'SortableQuestionItem'

// MAIN CONTAINER
interface SelectedQuestionListProps {
  selectedQuestions: SelectedQuestion[]
  onRemoveQuestion: (id: number) => void
  onReorderQuestions: (reordered: SelectedQuestion[]) => void
}

export const SelectedQuestionList: React.FC<SelectedQuestionListProps> = ({
  selectedQuestions,
  onRemoveQuestion,
  onReorderQuestions,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // allow click without starting drag immediately
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = selectedQuestions.findIndex((q) => q.question.id === active.id)
    const newIndex = selectedQuestions.findIndex((q) => q.question.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(selectedQuestions, oldIndex, newIndex)
      onReorderQuestions(reordered)
    }
  }

  const ids = useMemo(() => selectedQuestions.map((q) => q.question.id), [selectedQuestions])

  return (
    <Card className="p-5 flex flex-col gap-4 border border-[var(--border-primary)] shadow-sm bg-white min-h-[500px]">
      <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3">
        Câu hỏi đã chọn ({selectedQuestions.length})
      </h3>

      {selectedQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--text-muted)] italic">
          <p className="text-sm">Chưa có câu hỏi nào được chọn.</p>
          <p className="text-xs mt-1">Sử dụng nút "+" ở danh sách bên trái để thêm câu hỏi.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[550px] pr-1">
              {selectedQuestions.map((sq, index) => (
                <SortableQuestionItem
                  key={sq.question.id}
                  sq={sq}
                  index={index}
                  onRemove={onRemoveQuestion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  )
}
export default SelectedQuestionList
