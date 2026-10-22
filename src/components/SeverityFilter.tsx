import type { SeverityFilter } from '../types/incident'

const options: { value: SeverityFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'critical', label: 'Критические' },
  { value: 'warning', label: 'Предупреждения' },
  { value: 'info', label: 'Информация' },
]

interface SeverityFilterProps {
  value: SeverityFilter
  onChange: (value: SeverityFilter) => void
}

export function SeverityFilterControl({ value, onChange }: SeverityFilterProps) {
  return (
    <div aria-label="Фильтр по важности" className="flex flex-wrap gap-1" role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={`rounded-md px-2.5 py-1.5 text-xs transition ${
            value === option.value
              ? 'bg-[#e9eef1] font-semibold text-[#273944]'
              : 'text-[#687781] hover:bg-[#f2f5f6] hover:text-[#34454f]'
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
