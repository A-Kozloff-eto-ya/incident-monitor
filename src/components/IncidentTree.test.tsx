import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IncidentTree } from './IncidentTree'
import type { IncidentEvent } from '../types/incident'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: { count: number; estimateSize: () => number }) => ({
    getTotalSize: () => options.count * options.estimateSize(),
    getVirtualItems: () => Array.from({ length: options.count }, (_, index) => ({
      index,
      start: index * options.estimateSize(),
    })),
    measureElement: () => undefined,
  }),
}))

afterEach(cleanup)

const events: IncidentEvent[] = [
  { id: 'one', region: 'Центральный', department: 'Транспорт', severity: 'critical', message: 'Сбой маршрута', timestamp: 1_700_000_000_000 },
  { id: 'two', region: 'Центральный', department: 'Транспорт', severity: 'warning', message: 'Задержка рейса', timestamp: 1_700_000_000_500 },
]

describe('IncidentTree', () => {
  it('preserves expanded nodes when incoming events change', () => {
    const { rerender } = render(<IncidentTree events={events} severity="all" />)
    expect(screen.getByText('Структура')).toBeInTheDocument()
    expect(screen.getByText('Всего событий')).toBeInTheDocument()
    expect(screen.getByText('Критические')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Центральный/ }))
    fireEvent.click(screen.getByRole('button', { name: /Транспорт/ }))
    expect(screen.getByText('Важность')).toBeInTheDocument()
    expect(screen.getByText('Описание')).toBeInTheDocument()
    expect(screen.getByText('Время')).toBeInTheDocument()
    expect(screen.getByText('Сбой маршрута')).toBeInTheDocument()

    rerender(<IncidentTree events={[...events, { ...events[0], id: 'three', message: 'Новый инцидент' }]} severity="all" />)
    expect(screen.getByText('Сбой маршрута')).toBeInTheDocument()
    expect(screen.getByText('Новый инцидент')).toBeInTheDocument()
  })

  it('shows only matching incidents while retaining all-event counts', () => {
    render(<IncidentTree events={events} severity="critical" />)
    fireEvent.click(screen.getByRole('button', { name: /Центральный/ }))
    fireEvent.click(screen.getByRole('button', { name: /Транспорт/ }))
    expect(screen.getByText('Сбой маршрута')).toBeInTheDocument()
    expect(screen.queryByText('Задержка рейса')).not.toBeInTheDocument()
    expect(screen.getAllByTitle('Все сохранённые события').map((badge) => badge.textContent)).toEqual(['2', '2'])
    expect(screen.getAllByTitle('Критические события').map((badge) => badge.textContent)).toEqual(['1', '1'])
  })
})
