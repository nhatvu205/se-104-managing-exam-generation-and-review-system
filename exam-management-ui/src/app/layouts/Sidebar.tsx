import { sidebarItems } from './sidebar.config'
import { SidebarItem } from './SidebarItem'
import { X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`
        fixed left-0 top-0 z-50
        flex h-screen w-[280px] flex-col
        border-r border-[var(--border-primary)]
        bg-[var(--surface-primary)]
        p-4
        transition-transform duration-300 ease-in-out
        print:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      <div className="mb-8 px-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Exam System
          </h1>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ra đề & Chấm thi
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            lg:hidden
            rounded-[var(--radius-md)]
            p-2
            transition-all
            hover:bg-[var(--surface-secondary)]
            text-[var(--text-muted)]
            hover:text-[var(--text-primary)]
          "
          aria-label="Close Sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.path}
            {...item}
          />
        ))}
      </nav>
    </aside>
  )
}