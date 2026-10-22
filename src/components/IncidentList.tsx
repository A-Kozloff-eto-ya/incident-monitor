import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { IncidentEvent } from '../types/incident'

const severityLabel = {
  info: 'Информация',
  warning: 'Предупреждение',
  critical: 'Критическое',
}

const severityStyle = {
  info: 'bg-[#5a87a1]',
  warning: 'bg-[#b48232]',
  critical: 'bg-[#b64b47]',
}

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function IncidentList({ incidents }: { incidents: IncidentEvent[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: incidents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 8,
  })

  return (
    <div className="border-t border-[#edf0f2] bg-white">
      <div className="grid grid-cols-[minmax(100px,132px)_minmax(0,1fr)_auto] gap-3 bg-[#fbfcfc] py-2 pl-16 pr-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#89959d] sm:grid-cols-[150px_minmax(0,1fr)_110px] sm:gap-4 sm:pl-[4.5rem] sm:pr-5">
        <span>Важность</span>
        <span>Описание</span>
        <span className="text-right">Время</span>
      </div>
      <div
        aria-label="Список инцидентов"
        className="max-h-[420px] overflow-auto pl-16 pr-4 sm:pl-[4.5rem] sm:pr-5"
        ref={parentRef}
        role="list"
      >
        {incidents.length === 0 ? (
          <p className="py-4 text-xs text-[#87939b]">Нет событий для выбранного фильтра.</p>
        ) : (
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => {
              const event = incidents[row.index]
              return (
                <article
                  aria-label={`${severityLabel[event.severity]}: ${event.message}`}
                  className="absolute left-0 top-0 grid min-h-11 w-full grid-cols-[minmax(100px,132px)_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#f0f2f3] px-1 text-[12px] last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)_110px] sm:gap-4"
                  data-index={row.index}
                  key={event.id}
                  ref={virtualizer.measureElement}
                  role="listitem"
                  style={{ transform: `translateY(${row.start}px)` }}
                  title={`ID: ${event.id}`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#687780]">
                    <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${severityStyle[event.severity]}`} />
                    <span className="truncate">{severityLabel[event.severity]}</span>
                  </span>
                  <span className="min-w-0 truncate font-medium text-[#34434d]">{event.message}</span>
                  <time className="text-right font-mono text-[11px] tabular-nums text-[#87939b]">
                    {timeFormatter.format(event.timestamp)}
                  </time>
                </article>
              )
            })}
          </div>
        )}
        </div>
    </div>
  )
}
