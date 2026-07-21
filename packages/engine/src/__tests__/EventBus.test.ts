import { describe, expect, it, vi } from 'vitest'
import type { GameEvent } from '../events/EventBus.js'
import { EventBus } from '../events/EventBus.js'

describe('EventBus', () => {
  it('should deliver event to registered handler', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on(handler)
    const event: GameEvent = { type: 'wallBounce', bodyId: 'vehicle_0' }
    bus.emit(event)
    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should deliver to multiple handlers', () => {
    const bus = new EventBus()
    const h1 = vi.fn()
    const h2 = vi.fn()
    bus.on(h1)
    bus.on(h2)
    bus.emit({ type: 'wallBounce', bodyId: 'v1' })
    expect(h1).toHaveBeenCalledOnce()
    expect(h2).toHaveBeenCalledOnce()
  })

  it('should stop delivering after handler is removed', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on(handler)
    bus.off(handler)
    bus.emit({ type: 'wallBounce', bodyId: 'v1' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('should not throw when removing unregistered handler', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    expect(() => bus.off(handler)).not.toThrow()
  })

  it('should not throw when emitting with no handlers', () => {
    const bus = new EventBus()
    expect(() => bus.emit({ type: 'wallBounce', bodyId: 'v1' })).not.toThrow()
  })
})
