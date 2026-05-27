import { Bell, Menu } from 'lucide-react'

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header
      className="
        sticky top-0 z-20
        flex h-16 items-center justify-between
        border-b border-[var(--border-primary)]
        bg-[var(--surface-primary)]/90 backdrop-blur-md
        px-4 md:px-8
        print:hidden
      "
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="
            lg:hidden
            rounded-[var(--radius-md)]
            p-2
            transition-all
            hover:bg-[var(--surface-secondary)]
            text-[var(--text-primary)]
          "
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>

        <h2 className="text-base md:text-lg font-semibold text-[var(--text-primary)]">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="
            rounded-[var(--radius-md)]
            p-2
            transition-all
            hover:bg-[var(--surface-secondary)]
          "
        >
          <Bell size={20} />
        </button>

        <div
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full
            bg-[var(--accent-soft)]
            font-medium
            text-[var(--accent-primary)]
          "
        >
          GV
        </div>
      </div>
    </header>
  )
}