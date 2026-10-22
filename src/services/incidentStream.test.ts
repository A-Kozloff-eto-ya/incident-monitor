import { describe, expect, it } from 'vitest'
import { parseIncidentMessage, retainLatestEvents } from './incidentStream'
import type { IncidentEvent } from '../types/incident'

const event = (id: string): IncidentEvent => ({
  id,
  region: 'Центральный',
  department: 'Транспорт',
  severity: 'info',
  message: `Событие ${id}`,
  timestamp: 1_700_000_000_000,
})

describe('parseIncidentMessage', () => {
  it('parses valid incident data', () => {
    expect(parseIncidentMessage(JSON.stringify(event('a1')))).toEqual(event('a1'))
  })

  it('ignores malformed JSON and invalid payloads', () => {
    expect(parseIncidentMessage('{')).toBeNull()
    expect(parseIncidentMessage(JSON.stringify({ ...event('bad'), severity: 'urgent' }))).toBeNull()
  })
})

describe('retainLatestEvents', () => {
  it('keeps only the newest events up to the configured limit', () => {
    expect(retainLatestEvents([event('1'), event('2')], [event('3'), event('4')], 3).map((item) => item.id))
      .toEqual(['2', '3', '4'])
  })
})
