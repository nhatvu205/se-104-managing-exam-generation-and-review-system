import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/utils/cn'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'

type ButtonSize =
  | 'sm'
  | 'md'
  | 'lg'

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]',

  secondary:
    'border border-[var(--border-secondary)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]',

  tertiary:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]',

  danger:
    'bg-[var(--danger)] text-white hover:opacity-90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}  
      >
        {loading ? 'Đang tải...' : children}
      </button>
    )
  },
)

Button.displayName = 'Button'