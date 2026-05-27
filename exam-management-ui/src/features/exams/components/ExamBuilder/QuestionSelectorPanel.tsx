import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge/Badge'
import { questionService } from '@/features/question-bank/services/question.service'
import type { Question } from '@/features/question-bank/types/question.types'
import { Search, Plus, Check } from 'lucide-react'

interface QuestionSelectorPanelProps {
  selectedQuestionIds: number[]
  onAddQuestion: (question: Question) => void
  subjectFilter: string
}

export const QuestionSelectorPanel: React.FC<QuestionSelectorPanelProps> = ({
  selectedQuestionIds,
  onAddQuestion,
  subjectFilter,
}) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    const fetchBank = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await questionService.getQuestions()
        setQuestions(data)
      } catch (err: any) {
        setError('Không thể tải ngân hàng câu hỏi.')
      } finally {
        setLoading(false)
      }
    }
    fetchBank()
  }, [])

  // Local filtering
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.content.toLowerCase().includes(search.toLowerCase())
      const matchesDifficulty = difficulty ? q.difficulty === difficulty : true
      const matchesSubject = subjectFilter ? q.subject === subjectFilter : true
      return matchesSearch && matchesDifficulty && matchesSubject
    })
  }, [questions, search, difficulty, subjectFilter])

  return (
    <Card className="p-5 flex flex-col gap-4 border border-[var(--border-primary)] shadow-sm bg-white min-h-[500px]">
      <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3">
        Ngân hàng câu hỏi
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            placeholder="Tìm câu hỏi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        <Select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="h-11"
        >
          <option value="">-- Tất cả độ khó --</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </Select>
      </div>

      {subjectFilter && (
        <div className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--accent-soft)]/30 border border-[var(--accent-soft)] px-3 py-1.5 rounded-[var(--radius-sm)]">
          Đang lọc câu hỏi theo môn học: <span className="font-semibold">{subjectFilter}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3 py-10 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-t-transparent"></div>
          <span className="text-sm text-[var(--text-secondary)]">Đang tải câu hỏi...</span>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-sm text-[var(--danger)]">{error}</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--text-muted)] italic">
          Không tìm thấy câu hỏi phù hợp.
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[550px] pr-1">
          {filteredQuestions.map((q) => {
            const isAdded = selectedQuestionIds.includes(q.id)

            return (
              <div
                key={q.id}
                className={`p-3.5 border rounded-[var(--radius-md)] flex flex-col gap-2.5 transition-all duration-200 ${
                  isAdded
                    ? 'border-[var(--accent-soft)] bg-[var(--accent-soft)]/10'
                    : 'border-[var(--border-primary)] hover:border-[var(--accent-primary)] bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed line-clamp-3">
                    {q.content}
                  </p>
                  <Button
                    type="button"
                    variant={isAdded ? 'secondary' : 'primary'}
                    size="sm"
                    className="p-1 h-8 w-8 shrink-0 rounded-full"
                    onClick={() => !isAdded && onAddQuestion(q)}
                    disabled={isAdded}
                    aria-label={isAdded ? 'Đã chọn' : 'Thêm câu hỏi'}
                  >
                    {isAdded ? (
                      <Check className="h-4 w-4 text-[var(--success)]" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center mt-1">
                  <Badge variant="info">{q.subject}</Badge>
                  <Badge
                    variant={
                      q.difficulty === 'easy'
                        ? 'success'
                        : q.difficulty === 'medium'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {q.difficulty === 'easy'
                      ? 'Dễ'
                      : q.difficulty === 'medium'
                        ? 'Trung bình'
                        : 'Khó'}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">ID: #{q.id}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
export default QuestionSelectorPanel
