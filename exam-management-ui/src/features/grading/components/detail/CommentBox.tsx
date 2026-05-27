import React from 'react'

interface CommentBoxProps {
  value: string
  onChange: (feedback: string) => void
  placeholder?: string
}

export const CommentBox: React.FC<CommentBoxProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nhận xét hoặc phản hồi chi tiết cho câu trả lời của học sinh...',
}) => {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-xs font-semibold text-[var(--text-secondary)]">Nhận xét chi tiết</label>
      <textarea
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-xs text-[var(--text-primary)] bg-[var(--surface-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-colors placeholder:text-[var(--text-muted)] leading-relaxed resize-none"
      />
    </div>
  )
}
export default CommentBox
