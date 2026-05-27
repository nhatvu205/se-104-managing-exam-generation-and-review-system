import React from 'react'

interface QuestionFormLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export const QuestionFormLayout: React.FC<QuestionFormLayoutProps> = ({ left, right }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-24">
      {/* LEFT: Metadata & Question content & Answer options */}
      <div className="lg:col-span-8 flex flex-col gap-6 w-full">
        {left}
      </div>

      {/* RIGHT: Validation panel & Question preview */}
      <div className="lg:col-span-4 lg:sticky lg:top-6 flex flex-col gap-6 w-full">
        {right}
      </div>
    </div>
  )
}
