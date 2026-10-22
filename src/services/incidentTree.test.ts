import { describe, expect, it } from 'vitest'
import { buildIncidentTree } from './incidentTree'
import type { IncidentEvent } from '../types/incident'

const fixtures: IncidentEvent[] = [
  { id: 'a', region: 'Центральный', department: 'Транспорт', severity: 'critical', message: 'Сбой', timestamp: 1 },
  { id: 'b', region: 'Центральный', department: 'Транспорт', severity: 'warning', message: 'Задержка', timestamp: 2 },
  { id: 'c', region: 'Центральный', department: 'Связь', severity: 'info', message: 'Сигнал', timestamp: 3 },
  { id: 'd', region: 'Уральский', department: 'Энергетика', severity: 'critical', message: 'Отключение', timestamp: 4 },
]

describe('buildIncidentTree', () => {
  it('groups events and counts critical incidents across the unfiltered data', () => {
    const tree = buildIncidentTree(fixtures, 'all')
    expect(tree).toHaveLength(2)
    const central = tree.find((region) => region.name === 'Центральный')
    expect(central).toMatchObject({ name: 'Центральный', totalCount: 3, criticalCount: 1 })
    expect(central?.departments.find((department) => department.name === 'Транспорт'))
      .toMatchObject({ name: 'Транспорт', totalCount: 2, criticalCount: 1 })
  })

  it('filters visible incidents while keeping node totals independent of the filter', () => {
    const tree = buildIncidentTree(fixtures, 'warning')
    expect(tree).toHaveLength(1)
    expect(tree[0]).toMatchObject({ totalCount: 3, criticalCount: 1 })
    expect(tree[0].departments[0].incidents.map((event) => event.id)).toEqual(['b'])
  })
})
