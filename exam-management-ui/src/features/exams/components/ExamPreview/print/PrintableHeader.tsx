import React from 'react'

interface PrintableHeaderProps {
  title: string
  subject: string
  duration: number
  academicYear: string
  semester: string
}

export const PrintableHeader: React.FC<PrintableHeaderProps> = ({
  title,
  subject,
  duration,
  academicYear,
  semester,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full border-b-2 border-black pb-6 text-black font-serif">
      <div className="flex justify-between items-start gap-4">
        {/* LEFT DEPT BLOCK */}
        <div className="text-center flex flex-col gap-0.5 max-w-[280px]">
          <span className="text-xs uppercase tracking-wider font-bold">
            TRƯỜNG ĐẠI HỌC CÔNG NGHỆ
          </span>
          <span className="text-xs font-semibold uppercase">
            KHOA CÔNG NGHỆ THÔNG TIN
          </span>
          <span className="text-[10px] italic mt-1">Đề thi chính thức</span>
        </div>

        {/* RIGHT CODE BLOCK */}
        <div className="text-center flex flex-col gap-1 max-w-[320px] items-center">
          <span className="text-sm font-bold uppercase tracking-wide">
            ĐỀ THI KẾT THÚC HỌC PHẦN
          </span>
          <span className="text-xs font-semibold">
            Môn học: {subject}
          </span>
          <span className="text-[11px] font-medium">
            {semester} • Niên khóa {academicYear}
          </span>
          <span className="text-xs font-bold italic mt-0.5">
            Thời gian làm bài: {duration} phút
          </span>
        </div>
      </div>

      {/* STUDENT IDENTIFICATION BLOCK (FOR EXAM PAPERS) */}
      <div className="grid grid-cols-12 gap-3 border border-black/80 p-3 rounded-[var(--radius-sm)] text-xs mt-2">
        <div className="col-span-6 flex gap-2">
          <span>Họ và tên thí sinh:</span>
          <span className="flex-1 border-b border-dashed border-black/70"></span>
        </div>
        <div className="col-span-3 flex gap-2">
          <span>Mã số sinh viên:</span>
          <span className="flex-1 border-b border-dashed border-black/70"></span>
        </div>
        <div className="col-span-3 flex gap-2">
          <span>Lớp:</span>
          <span className="flex-1 border-b border-dashed border-black/70"></span>
        </div>
        <div className="col-span-4 flex gap-2 mt-1.5">
          <span>Số báo danh:</span>
          <span className="flex-1 border-b border-dashed border-black/70"></span>
        </div>
        <div className="col-span-4 flex gap-2 mt-1.5">
          <span>Phòng thi:</span>
          <span className="flex-1 border-b border-dashed border-black/70"></span>
        </div>
        <div className="col-span-4 flex gap-2 mt-1.5">
          <span>Chữ ký giám thị:</span>
          <span className="flex-1 border-b border-dashed border-black/70"></span>
        </div>
      </div>
    </div>
  )
}
export default PrintableHeader
