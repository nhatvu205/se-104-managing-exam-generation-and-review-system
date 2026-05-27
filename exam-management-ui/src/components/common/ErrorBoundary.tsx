import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--danger-bg)] bg-[var(--danger-bg)] p-8 text-center text-[var(--text-primary)] opacity-90">
          <svg
            className="mb-4 h-12 w-12 text-[var(--danger)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="presentation"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            Đã xảy ra lỗi
          </h3>
          <p className="max-w-md text-sm text-[var(--text-secondary)]">
            {this.state.error?.message || 'Có lỗi xảy ra khi tải nội dung này. Vui lòng tải lại trang hoặc thử lại sau.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-all duration-200"
          >
            Thử lại
          </button>
        </div>
      )
    }

    return this.children
  }

  private get fallback() {
    return this.props.fallback
  }
}
