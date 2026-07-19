import { describe, expect, it } from 'vitest'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { BodyConfig, WorldConfig } from '../physics/types.js'

const defaultWorld: WorldConfig = {
  width: 1200,
  height: 800,
  walls: [
    { x1: 0, y1: 0, x2: 1200, y2: 0, type: 'bounce' },
    { x1: 1200, y1: 0, x2: 1200, y2: 800, type: 'bounce' },
    { x1: 1200, y1: 800, x2: 0, y2: 800, type: 'bounce' },
    { x1: 0, y1: 800, x2: 0, y2: 0, type: 'bounce' },
  ],
}

function createVehicle(overrides: Partial<BodyConfig> = {}): BodyConfig {
  return {
    id: 'test-vehicle',
    type: 'vehicle',
    shape: 'circle',
    radius: 20,
    x: 400,
    y: 400,
    angle: 0,
    mass: 1,
    restitution: 0.5,
    friction: 0.1,
    ...overrides,
  }
}

describe('MatterPhysicsEngine', () => {
  it('should create a world', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(defaultWorld)
    const state = engine.getWorldState()
    expect(state.time).toBeGreaterThanOrEqual(0)
  })

  it('should add and remove a body', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(defaultWorld)
    const id = engine.addBody(createVehicle())
    expect(engine.getBody(id)).toBeDefined()
    engine.removeBody(id)
    expect(engine.getBody(id)).toBeUndefined()
  })

  it('should step the simulation forward', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(defaultWorld)
    const id = engine.addBody(createVehicle({ x: 400, y: 400 }))

    engine.applyForce(id, { x: 0.05, y: 0 })
    const before = engine.getBody(id)!
    engine.step(1000 / 60)
    const after = engine.getBody(id)!

    expect(after.x).not.toBe(before.x)
  })

  it('should return body state from getBodies', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(defaultWorld)
    engine.addBody(createVehicle({ id: 'v1' }))
    engine.addBody(createVehicle({ id: 'v2' }))

    const bodies = engine.getBodies()
    expect(bodies).toHaveLength(2)
    expect(bodies.map((b) => b.id).sort()).toEqual(['v1', 'v2'])
  })

  it('should set body velocity', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(defaultWorld)
    const id = engine.addBody(createVehicle())
    engine.setBodyVelocity(id, { x: 5, y: 0 })
    engine.step(1000 / 60)
    const state = engine.getBody(id)!
    expect(state.velocityX).toBeGreaterThan(0)
  })
})
