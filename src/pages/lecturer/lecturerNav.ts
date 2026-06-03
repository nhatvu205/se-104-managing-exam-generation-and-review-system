export const lecturerNavItems = [
  { label: 'Tạo câu hỏi', to: '/lecturer/questions/create' },
  { label: 'Ngân hàng câu hỏi', to: '/lecturer/questions' },
  { label: 'Tạo đề thi', to: '/lecturer/exams/create' },
  { label: 'Đề thi của tôi', to: '/lecturer/exams' },
  { label: 'Tra cứu đề thi', to: '/lecturer/search' },
  { label: 'Chấm thi', to: '/lecturer/grading' },
  { label: 'Tổng hợp điểm lớp', to: '/lecturer/grading-summary' },
  { label: 'Báo cáo năm', to: '/lecturer/year-report' },
] as const;

export function withLecturerActive(activeTo: string) {
  return lecturerNavItems.map((item) => ({
    ...item,
    active: item.to === activeTo,
  }));
}
