import {
  LayoutDashboard,
  FileQuestion,
  SquarePen,
  FileText,
  ClipboardList,
  Search,
  ClipboardCheck,
} from 'lucide-react'

export const sidebarItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Ngân hàng câu hỏi',
    path: '/questions',
    icon: FileQuestion,
  },
  {
    label: 'Tạo câu hỏi',
    path: '/questions/create',
    icon: SquarePen,
  },
  {
    label: 'Đề thi của tôi',
    path: '/exams',
    icon: FileText,
  },
  {
    label: 'Tạo đề thi',
    path: '/exams/create',
    icon: ClipboardList,
  },
  {
    label: 'Tra cứu đề thi',
    path: '/search',
    icon: Search,
  },
  {
    label: 'Chấm thi',
    path: '/grading',
    icon: ClipboardCheck,
  },
]