import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useExamBuilderState } from '../../hooks/useExamBuilderState'
import { useExamBuilderActions } from '../../hooks/useExamBuilderActions'
import { useExamValidation } from '../../hooks/useExamValidation'
import { builderService } from '../../services/builder.service'
import { ExamMetadataForm } from './ExamMetadataForm'
import { QuestionSelectorPanel } from './QuestionSelectorPanel'
import { SelectedQuestionList } from './SelectedQuestionList'
import { RubricEditor } from './RubricEditor'
import { ValidationSidebar } from './ValidationSidebar'

export const ExamBuilderLayout: React.FC = () => {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const { metadata, selectedQuestions } = useExamBuilderState()
  const { setMetadata, addQuestion, removeQuestion, reorderQuestions, updateQuestionScore, resetBuilder } = useExamBuilderActions()
  const validation = useExamValidation()

  // Validate metadata locally (title and subject are required)
  const isMetadataValid = !!metadata.title && !!metadata.subject

  const selectedIds = React.useMemo(
    () => selectedQuestions.map((q) => q.question.id),
    [selectedQuestions]
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await builderService.saveExam(metadata, selectedQuestions)
      resetBuilder()
      navigate('/exams')
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi lưu đề thi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy bỏ? Mọi thay đổi chưa lưu sẽ bị mất.')) {
      resetBuilder()
      navigate('/exams')
    }
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-16">
        {/* LEFT COLUMN: MetadataForm, QuestionSelector, SelectedQuestionList, RubricEditor */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          <ExamMetadataForm
            metadata={metadata}
            onChange={setMetadata}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <QuestionSelectorPanel
              selectedQuestionIds={selectedIds}
              onAddQuestion={addQuestion}
              subjectFilter={metadata.subject}
            />

            <SelectedQuestionList
              selectedQuestions={selectedQuestions}
              onRemoveQuestion={removeQuestion}
              onReorderQuestions={reorderQuestions}
            />
          </div>

          <RubricEditor
            selectedQuestions={selectedQuestions}
            onUpdateScore={updateQuestionScore}
            totalScore={validation.totalScore}
          />
        </div>

        {/* RIGHT COLUMN: Validation Checklist sidebar */}
        <div className="lg:col-span-4 w-full">
          <ValidationSidebar
            validation={validation}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            isMetadataValid={isMetadataValid}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
export default ExamBuilderLayout
