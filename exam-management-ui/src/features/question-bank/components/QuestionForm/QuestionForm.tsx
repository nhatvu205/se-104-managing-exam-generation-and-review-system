import React from 'react'
import { useQuestionForm } from '../../hooks/useQuestionForm'
import { QuestionFormLayout } from './layout/QuestionFormLayout'
import { QuestionActionFooter } from './layout/QuestionActionFooter'
import { QuestionMetadataSection } from './sections/QuestionMetadataSection'
import { QuestionContentSection } from './sections/QuestionContentSection'
import { AnswerOptionList } from './sections/AnswerOptionList'
import { ValidationPanel } from './ValidationPanel'
import { QuestionPreviewPanel } from './QuestionPreviewPanel'

interface QuestionFormProps {
  id?: number
  onCancel: () => void
  onSuccess: () => void
  initialValues?: any
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  id,
  onCancel,
  onSuccess,
  initialValues,
}) => {
  const {
    form,
    fields,
    handleAddAnswer,
    handleRemoveAnswer,
    handleSetCorrectAnswer,
    onSubmit,
    isSubmitting,
    submitError,
  } = useQuestionForm({ id, onSuccess, initialValues })

  const { register, watch, formState: { errors, isValid } } = form

  // Watch fields in real-time for preview and check-list panels
  const watchedValues = watch()

  return (
    <form onSubmit={onSubmit} className="w-full">
      {submitError && (
        <div className="mb-6 p-4 rounded-[var(--radius-md)] border border-[var(--danger)] bg-[var(--danger-bg)] text-sm text-[var(--danger)] font-medium">
          {submitError}
        </div>
      )}

      <QuestionFormLayout
        left={
          <>
            <QuestionMetadataSection form={form} />
            <QuestionContentSection form={form} />
            <AnswerOptionList
              register={register}
              fields={fields}
              errors={errors}
              handleAddAnswer={handleAddAnswer}
              handleRemoveAnswer={handleRemoveAnswer}
              handleSetCorrectAnswer={handleSetCorrectAnswer}
            />
          </>
        }
        right={
          <>
            <ValidationPanel
              errors={errors}
              touchedFields={form.formState.touchedFields}
              values={watchedValues}
            />
            <QuestionPreviewPanel values={watchedValues} />
          </>
        }
      />

      <QuestionActionFooter
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isValid={isValid}
      />
    </form>
  )
}
export default QuestionForm
