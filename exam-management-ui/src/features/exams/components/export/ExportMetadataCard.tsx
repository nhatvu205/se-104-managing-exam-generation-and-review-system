import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ExportMetadataCardProps {
  title: string
  subject: string
  duration: number
  academicYear: string
  semester: string
  onChange: (field: string, value: any) => void
}

export const ExportMetadataCard: React.FC<ExportMetadataCardProps> = ({
  title,
  subject,
  duration,
  academicYear,
  semester,
  onChange,
}) => {
  return (
    <Card className="p-4 flex flex-col gap-4 border border-[var(--border-secondary)] bg-white rounded-[var(--radius-lg)]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Thông tin in ấn</h3>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Tiêu đề đề thi</label>
          <Input
            value={title}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Môn học</label>
            <Input
              value={subject}
              onChange={(e) => onChange('subject', e.target.value)}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Thời gian (phút)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => onChange('duration', parseInt(e.target.value) || 0)}
              className="w-full text-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Năm học</label>
            <Input
              value={academicYear}
              onChange={(e) => onChange('academicYear', e.target.value)}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Học kỳ</label>
            <Input
              value={semester}
              onChange={(e) => onChange('semester', e.target.value)}
              className="w-full text-xs"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
export default ExportMetadataCard
