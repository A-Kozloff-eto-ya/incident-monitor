import { useMemo, useState } from 'react'
import { buildIncidentTree } from '../services/incidentTree'
import type { IncidentEvent, SeverityFilter } from '../types/incident'
import { IncidentList } from './IncidentList'

function NodeCounts({ total, critical }: { total: number; critical: number }) {
  return (
    <>
      <span className="text-right font-mono text-xs tabular-nums text-[#65737d]" title="Все сохранённые события">{total.toLocaleString('ru-RU')}</span>
      <span className={`text-right font-mono text-xs tabular-nums ${critical > 0 ? 'font-semibold text-[#a74642]' : 'text-[#9aa4aa]'}`} title="Критические события">
        {critical.toLocaleString('ru-RU')}
      </span>
    </>
  )
}

function Disclosure({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 text-[#84919a] transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 16 16">
      <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

export function IncidentTree({ events, severity }: { events: IncidentEvent[]; severity: SeverityFilter }) {
  const tree = useMemo(() => buildIncidentTree(events, severity), [events, severity])
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const toggle = (key: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  if (tree.length === 0) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-[#475760]">Подходящих событий пока нет</p>
        <p className="mt-1 text-xs text-[#87939b]">Новые сообщения появятся здесь автоматически.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_3.4rem_4.1rem] items-center gap-2 border-b border-[#e5eaed] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#82909a] sm:grid-cols-[minmax(0,1fr)_7rem_7.5rem] sm:px-5">
        <span>Структура</span>
        <span className="text-right"><span className="sm:hidden">Всего</span><span className="hidden sm:inline">Всего событий</span></span>
        <span className="text-right"><span className="sm:hidden">Крит.</span><span className="hidden sm:inline">Критические</span></span>
      </div>
      {tree.map((region) => {
        const regionKey = `region:${region.name}`
        const regionOpen = expanded.has(regionKey)
        return (
          <section className="border-b border-[#e5eaed] last:border-b-0" key={regionKey}>
            <button
              aria-expanded={regionOpen}
              className="grid w-full grid-cols-[minmax(0,1fr)_3.4rem_4.1rem] items-center gap-2 bg-[#f7f9fa] px-4 py-3 text-left transition-colors hover:bg-[#f1f4f5] sm:grid-cols-[minmax(0,1fr)_7rem_7.5rem] sm:px-5"
              onClick={() => toggle(regionKey)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Disclosure open={regionOpen} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[#2c3b45]">{region.name}</span>
                  <span className="mt-0.5 block text-[11px] text-[#89959d]">Регион · {region.departments.length} подразделения</span>
                </span>
              </span>
              <NodeCounts critical={region.criticalCount} total={region.totalCount} />
            </button>

            {regionOpen && (
              <div>
                {region.departments.map((department) => {
                  const departmentKey = `department:${region.name}:${department.name}`
                  const departmentOpen = expanded.has(departmentKey)
                  return (
                    <div className="border-t border-[#edf0f2] first:border-t-0" key={departmentKey}>
                      <button
                        aria-expanded={departmentOpen}
                        className="grid w-full grid-cols-[minmax(0,1fr)_3.4rem_4.1rem] items-center gap-2 py-2.5 pl-8 pr-4 text-left transition-colors hover:bg-[#fafbfb] sm:grid-cols-[minmax(0,1fr)_7rem_7.5rem] sm:pl-10 sm:pr-5"
                        onClick={() => toggle(departmentKey)}
                        type="button"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Disclosure open={departmentOpen} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium text-[#42515a]">{department.name}</span>
                            <span className="mt-0.5 block text-[10px] text-[#929da4]">Подразделение</span>
                          </span>
                        </span>
                        <NodeCounts critical={department.criticalCount} total={department.totalCount} />
                      </button>
                      {departmentOpen && <IncidentList incidents={department.incidents} />}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
