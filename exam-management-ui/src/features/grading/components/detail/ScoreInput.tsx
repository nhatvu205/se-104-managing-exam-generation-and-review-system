import React from 'react'

interface ScoreInputProps {
  value: number
  maxScore: number
  onChange: (score: number) => void
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  maxScore,
  onChange,
}) => {
  const [error, setError] = React.useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    
    if (isNaN(val)) {
      setError('Cần nhập một số hợp lệ')
      onChange(0)
      return
    }

    if (val < 0) {
      setError('Điểm không được âm')
      onChange(0)
    } else if (val > maxScore) {
      setError(`Điểm tối đa là ${maxScore}`)
      onChange(maxScore)
    } else {
      setError(null)
      onChange(val)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0 w-32">
      <label className="text-xs font-semibold text-[var(--text-secondary)]">Điểm chấm</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          step="0.25"
          min="0"
          max={maxScore}
          value={value || ''}
          placeholder="0.0"
          onChange={handleChange}
          className={`w-full px-2.5 py-1.5 border rounded-[var(--radius-md)] text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-colors ${
            error
              ? 'border-[var(--danger)] bg-red-50 text-[var(--danger)] focus:ring-[var(--danger)]'
              : 'border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-primary)]'
          }`}
        />
        <span className="text-xs text-[var(--text-muted)] font-semibold shrink-0">/ {maxScore}đ</span>
      </div>
      {error && <span className="text-[10px] text-[var(--danger)] font-medium">{error}</span>}
    </div>
  )
}
export default ScoreInput
