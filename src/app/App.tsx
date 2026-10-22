import { useState } from 'react'
import { IncidentTree } from '../components/IncidentTree'
import { SeverityFilterControl } from '../components/SeverityFilter'
import { useIncidentStream } from '../hooks/useIncidentStream'
import type { SeverityFilter } from '../types/incident'

export default function App() {
  const { events, connected } = useIncidentStream()
  const [severity, setSeverity] = useState<SeverityFilter>('all')

  return (
    <main className="min-h-screen bg-[#e8ecef] px-4 py-6 text-[#202a33] sm:px-8 sm:py-10">
      <section aria-label="Инциденты" className="mx-auto max-w-[1240px] overflow-hidden rounded-lg border border-[#d9e0e4] bg-white shadow-[0_1px_2px_rgba(24,39,50,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#e4e9ec] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-[#273640]">Инциденты</h1>
            <span className="h-4 w-px bg-[#dce2e6]" />
            <div className="flex items-center gap-2 text-xs text-[#687781]">
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-[#31866a]' : 'bg-[#c18a34]'}`} />
              <span>{connected ? 'Подключено' : 'Нет соединения'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-[#75828c]">Важность</span>
            <SeverityFilterControl onChange={setSeverity} value={severity} />
          </div>
        </div>

        <IncidentTree events={events} severity={severity} />
      </section>
    </main>
  )
}
