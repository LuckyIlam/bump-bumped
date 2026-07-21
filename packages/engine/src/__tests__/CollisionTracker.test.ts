import { describe, expect, it, vi } from 'vitest'
import { EventBus } from '../events/EventBus.js'
import type { CollisionCallback, IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import type { CollisionEvent } from '../physics/types.js'
import { CollisionTracker } from '../state/CollisionTracker.js'

class MockEngine implements IPhysicsEngine {
  private callback: CollisionCallback | null = null

  onCollision(callback: CollisionCallback): void {
    this.callback = callback
  }

  fireCollision(event: CollisionEvent): void {
    this.callback?.(event)
  }

  createWorld(): void {}
  setGravity(): void {}
  addBody(): string {
    return ''
  }
  removeBody(): void {}
  getBody() {
    return undefined
  }
  setBodyVelocity(): void {}
  setAngularVelocity(): void {}
  setFrictionAir(): void {}
  applyForce(): void {}
  step(): void {}
  getBodies() {
    return []
  }
  getWorldState() {
    return { time: 0, bodies: [] }
  }
}

function wallBounce(vehicleId: string): CollisionEvent {
  return { bodyA: vehicleId, bodyB: 'wall', relativeVelocity: 5 }
}

function vehicleCollision(a: string, b: string): CollisionEvent {
  return { bodyA: a, bodyB: b, relativeVelocity: 3 }
}

describe('CollisionTracker', () => {
  describe('wall bounces', () => {
    it('should count wall bounces per vehicle', () => {
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine)
      tracker.setVehicles(['v1', 'v2'])

      engine.fireCollision(wallBounce('v1'))
      engine.fireCollision(wallBounce('v1'))
      engine.fireCollision(wallBounce('v2'))

      expect(tracker.getBounceCount('v1')).toBe(2)
      expect(tracker.getBounceCount('v2')).toBe(1)
    })

    it('should return 0 for vehicle with no bounces', () => {
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine)
      tracker.setVehicles(['v1'])
      expect(tracker.getBounceCount('v1')).toBe(0)
    })

    it('should emit wallBounce event on each wall collision', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.on(handler)
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine, bus)
      tracker.setVehicles(['v1'])

      engine.fireCollision(wallBounce('v1'))

      expect(handler).toHaveBeenCalledWith({ type: 'wallBounce', bodyId: 'v1' })
    })
  })

  describe('vehicle collisions', () => {
    it('should record last hitter for both vehicles', () => {
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine)
      tracker.setVehicles(['v1', 'v2'])

      engine.fireCollision(vehicleCollision('v1', 'v2'))

      expect(tracker.getLastHitter('v1')).toBe('v2')
      expect(tracker.getLastHitter('v2')).toBe('v1')
    })

    it('should emit vehicleCollision event', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.on(handler)
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine, bus)
      tracker.setVehicles(['v1', 'v2'])

      engine.fireCollision(vehicleCollision('v1', 'v2'))

      expect(handler).toHaveBeenCalledWith({
        type: 'vehicleCollision',
        bodyA: 'v1',
        bodyB: 'v2',
        relativeVelocity: 3,
      })
    })

    it('should return null for last hitter when no collision occurred', () => {
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine)
      tracker.setVehicles(['v1'])
      expect(tracker.getLastHitter('v1')).toBeNull()
    })
  })

  describe('setVehicles', () => {
    it('should only track collisions involving known vehicles', () => {
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine)
      tracker.setVehicles(['v1'])

      engine.fireCollision(wallBounce('v1'))
      engine.fireCollision(wallBounce('unknown'))

      expect(tracker.getBounceCount('v1')).toBe(1)
      expect(tracker.getBounceCount('unknown')).toBe(0)
    })
  })

  describe('clear', () => {
    it('should reset all counts and hitters', () => {
      const engine = new MockEngine()
      const tracker = new CollisionTracker(engine)
      tracker.setVehicles(['v1', 'v2'])

      engine.fireCollision(wallBounce('v1'))
      engine.fireCollision(vehicleCollision('v1', 'v2'))
      tracker.clear()

      expect(tracker.getBounceCount('v1')).toBe(0)
      expect(tracker.getLastHitter('v1')).toBeNull()
    })
  })
})
