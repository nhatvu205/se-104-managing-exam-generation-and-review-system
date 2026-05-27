import React from 'react'
import { Card } from '@/components/ui/card'
import type { ExportSettings } from '../../types/export.types'

interface ExportSettingsPanelProps {
  settings: ExportSettings
  onChangeSetting: <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => void
}

export const ExportSettingsPanel: React.FC<ExportSettingsPanelProps> = ({
  settings,
  onChangeSetting,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Configuration Card */}
      <Card className="p-4 border border-[var(--border-secondary)] bg-white rounded-[var(--radius-lg)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Cấu hình trang in</h3>
        
        <div className="flex flex-col gap-4 text-xs">
          {/* Margins */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--text-secondary)]">Căn lề (Margin)</span>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'wide'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChangeSetting('margin', m)}
                  className={`py-1.5 px-2 rounded-[var(--radius-md)] border text-center font-medium transition-all ${
                    settings.margin === m
                      ? 'bg-[var(--primary-light)] text-[var(--primary-color)] border-[var(--primary-color)]'
                      : 'border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                  }`}
                >
                  {m === 'compact' ? 'Hẹp' : m === 'normal' ? 'Vừa' : 'Rộng'}
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizes */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--text-secondary)]">Kích thước chữ (Font size)</span>
            <div className="grid grid-cols-3 gap-2">
              {(['sm', 'base', 'lg'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onChangeSetting('fontSize', f)}
                  className={`py-1.5 px-2 rounded-[var(--radius-md)] border text-center font-medium transition-all ${
                    settings.fontSize === f
                      ? 'bg-[var(--primary-light)] text-[var(--primary-color)] border-[var(--primary-color)]'
                      : 'border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                  }`}
                >
                  {f === 'sm' ? 'Nhỏ' : f === 'base' ? 'Thường' : 'Lớn'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--border-secondary)] my-1" />

          {/* Toggle Switches */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-[var(--text-secondary)]">Hiển thị Tiêu đề chính</span>
              <input
                type="checkbox"
                checked={settings.showMetadata}
                onChange={(e) => onChangeSetting('showMetadata', e.target.checked)}
                className="rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)] h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-[var(--text-secondary)]">Hiển thị Phần ghi chú/hướng dẫn</span>
              <input
                type="checkbox"
                checked={settings.showInstructions}
                onChange={(e) => onChangeSetting('showInstructions', e.target.checked)}
                className="rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)] h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-[var(--text-secondary)]">Hiển thị Thông tin thí sinh</span>
              <input
                type="checkbox"
                checked={settings.showStudentCard}
                onChange={(e) => onChangeSetting('showStudentCard', e.target.checked)}
                className="rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)] h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-[var(--text-secondary)]">Chia 2 cột đáp án trắc nghiệm</span>
              <input
                type="checkbox"
                checked={settings.twoColumnChoices}
                onChange={(e) => onChangeSetting('twoColumnChoices', e.target.checked)}
                className="rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)] h-4 w-4"
              />
            </label>
          </div>
        </div>
      </Card>
    </div>
  )
}
export default ExportSettingsPanel
