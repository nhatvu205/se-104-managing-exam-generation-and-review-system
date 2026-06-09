export const lecturerNavItems = [
  { label: 'Quản lý lớp học', to: '/lecturer/classes' },
  { label: 'Danh sách môn học', to: '/lecturer/subjects' },
  { label: 'Tạo câu hỏi', to: '/lecturer/questions/create' },
  { label: 'Ngân hàng câu hỏi', to: '/lecturer/questions' },
  { label: 'Tạo đề thi', to: '/lecturer/exams/create' },
  { label: 'Đề thi của tôi', to: '/lecturer/exams' },
  { label: 'Tra cứu đề thi', to: '/lecturer/search' },
  { label: 'Chấm thi', to: '/lecturer/grading' },
  { label: 'Báo cáo năm', to: '/lecturer/year-report' },
] as const;

export function withLecturerActive(activeTo: string) {
  return lecturerNavItems.map((item) => ({
    ...item,
    active: item.to === activeTo,
  }));
}
