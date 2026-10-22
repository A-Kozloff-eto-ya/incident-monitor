import { StrictMode, type ReactNode } from 'react'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIncidentStream } from './useIncidentStream'

class MockEventSource {
  static instances: MockEventSource[] = []
  onopen: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  closed = false

  constructor(readonly url: string) {
    MockEventSource.instances.push(this)
  }

  close() {
    this.closed = true
  }

  emit(value: unknown) {
    this.onmessage?.({ data: JSON.stringify(value) } as MessageEvent<string>)
  }
}

function strictWrapper({ children }: { children: ReactNode }) {
  return <StrictMode>{children}</StrictMode>
}

describe('useIncidentStream', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    vi.useFakeTimers()
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('batches messages, enforces the retention limit, and closes StrictMode connections', () => {
    const { result, unmount, rerender } = renderHook(
      ({ url }) => useIncidentStream(url, 250, 2),
      { initialProps: { url: '/api/events' }, wrapper: strictWrapper },
    )
    expect(MockEventSource.instances).toHaveLength(1)
    const activeSource = MockEventSource.instances[0]

    act(() => {
      activeSource.emit({ id: 'one', region: 'Центральный', department: 'Связь', severity: 'info', message: 'Первое', timestamp: 1 })
      activeSource.emit({ id: 'two', region: 'Центральный', department: 'Связь', severity: 'warning', message: 'Второе', timestamp: 2 })
    })
    expect(result.current.events).toHaveLength(0)

    act(() => vi.advanceTimersByTime(249))
    expect(result.current.events).toHaveLength(0)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.events.map((event) => event.id)).toEqual(['one', 'two'])

    act(() => {
      activeSource.emit({ id: 'three', region: 'Центральный', department: 'Связь', severity: 'critical', message: 'Третье', timestamp: 3 })
      vi.advanceTimersByTime(250)
    })
    expect(result.current.events.map((event) => event.id)).toEqual(['two', 'three'])

    act(() => {
      activeSource.emit({ id: 'pending', region: 'Центральный', department: 'Связь', severity: 'info', message: 'Не должно попасть в состояние', timestamp: 4 })
    })
    rerender({ url: '/api/events?reconnect=1' })
    expect(activeSource.closed).toBe(true)
    expect(activeSource.onmessage).toBeNull()

    const replacementSource = MockEventSource.instances[1]
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.events.map((event) => event.id)).toEqual(['two', 'three'])
    act(() => {
      replacementSource.emit({ id: 'four', region: 'Центральный', department: 'Связь', severity: 'info', message: 'После переподключения', timestamp: 5 })
      vi.advanceTimersByTime(250)
    })
    expect(result.current.events.map((event) => event.id)).toEqual(['three', 'four'])

    unmount()
    expect(replacementSource.closed).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })
})
