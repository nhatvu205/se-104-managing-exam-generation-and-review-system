import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'

interface SidebarItemProps {
  label: string
  path: string
  icon: React.ElementType
}

export function SidebarItem({
  label,
  path,
  icon: Icon,
}: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium transition-all duration-200',
          'hover:bg-[var(--surface-secondary)]',
          isActive
            ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
            : 'text-[var(--text-secondary)]',
        )
      }
    >
      <Icon size={18} />

      <span>{label}</span>
    </NavLink>
  )
}