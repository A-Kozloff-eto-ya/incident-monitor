import { useEffect, useRef, useState } from 'react'
import { parseIncidentMessage, retainLatestEvents } from '../services/incidentStream'
import type { IncidentEvent } from '../types/incident'

interface IncidentStreamState {
  events: IncidentEvent[]
  connected: boolean
}

export function useIncidentStream(
  url = '/api/events',
  flushInterval = 250,
  maxEvents = 3_000,
): IncidentStreamState {
  const [events, setEvents] = useState<IncidentEvent[]>([])
  const [connected, setConnected] = useState(false)
  const queueRef = useRef<IncidentEvent[]>([])
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const source = new EventSource(url)
    sourceRef.current = source
    let active = true
    const knownIds = new Set<string>()

    const timer = window.setInterval(() => {
      if (!active || queueRef.current.length === 0) return
      const batch = queueRef.current
      queueRef.current = []
      setEvents((current) => {
        const next = retainLatestEvents(current, batch, maxEvents)
        knownIds.clear()
        for (const event of next) knownIds.add(event.id)
        for (const event of queueRef.current) knownIds.add(event.id)
        return next
      })
    }, flushInterval)

    source.onopen = () => {
      if (active) setConnected(true)
    }
    source.onerror = () => {
      if (active) setConnected(false)
    }
    source.onmessage = (message) => {
      if (!active) return
      const event = parseIncidentMessage(message.data)
      if (!event || knownIds.has(event.id)) return
      knownIds.add(event.id)
      queueRef.current.push(event)
    }

    return () => {
      active = false
      window.clearInterval(timer)
      source.close()
      source.onopen = null
      source.onerror = null
      source.onmessage = null
      if (sourceRef.current === source) sourceRef.current = null
      queueRef.current = []
    }
  }, [url, flushInterval, maxEvents])

  return { events, connected }
}
