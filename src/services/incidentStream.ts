import { SEVERITIES, type IncidentEvent } from '../types/incident'

export function parseIncidentMessage(data: string): IncidentEvent | null {
  try {
    const value: unknown = JSON.parse(data)
    if (!value || typeof value !== 'object') return null

    const event = value as Record<string, unknown>
    if (
      typeof event.id !== 'string' ||
      typeof event.region !== 'string' ||
      typeof event.department !== 'string' ||
      typeof event.message !== 'string' ||
      typeof event.timestamp !== 'number' ||
      !SEVERITIES.includes(event.severity as (typeof SEVERITIES)[number])
    ) {
      return null
    }

    return {
      id: event.id,
      region: event.region,
      department: event.department,
      severity: event.severity as IncidentEvent['severity'],
      message: event.message,
      timestamp: event.timestamp,
    }
  } catch {
    return null
  }
}

export function retainLatestEvents(
  current: IncidentEvent[],
  incoming: IncidentEvent[],
  limit: number,
): IncidentEvent[] {
  if (limit <= 0) return []
  return [...current, ...incoming].slice(-limit)
}
