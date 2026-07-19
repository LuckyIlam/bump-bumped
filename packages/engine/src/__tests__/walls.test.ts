import { describe, it, expect } from 'vitest'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { BodyConfig } from '../physics/types.js'

function vehicle(overrides: Partial<BodyConfig> = {}): BodyConfig {
  return { id: 'v1', type: 'vehicle', shape: 'circle', radius: 15, x: 400, y: 50, angle: 0, mass: 1, restitution: 0.5, friction: 0.1, ...overrides }
}

describe('Wall behaviours', () => {
  it('bounce wall reflects downward velocity to upward', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld({
      width: 800, height: 600,
      walls: [{ x1: 0, y1: 200, x2: 800, y2: 200, type: 'bounce' }],
    })
    const id = engine.addBody(vehicle({ x: 400, y: 50 }))
    engine.setBodyVelocity(id, { x: 0, y: 30 })
    for (let i = 0; i < 60; i++) {
      engine.step(1 / 60)
    }
    const state = engine.getBody(id)!
    expect(state.velocityY).toBeLessThan(0)
  })

  it('absorb wall stops the vehicle', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld({
      width: 800, height: 600,
      walls: [{ x1: 0, y1: 200, x2: 800, y2: 200, type: 'absorb' }],
    })
    const id = engine.addBody(vehicle({ restitution: 0 }))
    engine.setBodyVelocity(id, { x: 0, y: 30 })
    for (let i = 0; i < 30; i++) {
      engine.step(1 / 60)
    }
    const state = engine.getBody(id)!
    expect(Math.abs(state.velocityY)).toBeLessThan(0.1)
  })

  it('amplify wall increases speed away from wall', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld({
      width: 800, height: 600,
      walls: [{ x1: 0, y1: 200, x2: 800, y2: 200, type: 'amplify' }],
    })
    const id = engine.addBody(vehicle({ restitution: 0 }))
    engine.setBodyVelocity(id, { x: 0, y: 30 })

    const vels: number[] = []
    for (let i = 0; i < 20; i++) {
      engine.step(1 / 60)
      const s = engine.getBody(id)!
      vels.push(s.velocityY)
    }
    expect(vels.some(v => Math.abs(v) > 30)).toBe(true)
  })

  it('reflect wall bounces elastically preserving parallel velocity', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld({
      width: 800, height: 600,
      walls: [{ x1: 0, y1: 200, x2: 800, y2: 200, type: 'reflect' }],
    })
    const id = engine.addBody(vehicle({ restitution: 0, friction: 0 }))
    engine.setBodyVelocity(id, { x: 3, y: 30 })
    for (let i = 0; i < 30; i++) {
      engine.step(1 / 60)
    }
    const state = engine.getBody(id)!
    expect(state.velocityY).toBeLessThan(0)
    expect(Math.abs(state.velocityX)).toBeGreaterThan(0)
  })
})
