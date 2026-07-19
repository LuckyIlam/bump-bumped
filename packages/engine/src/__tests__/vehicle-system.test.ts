import { describe, it, expect } from 'vitest'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import { VehicleSystem, DEFAULT_VEHICLE_CONFIG } from '../systems/VehicleSystem.js'
import { DEFAULT_BOOST_CONFIG } from '../config/boost-config.js'
import type { WorldConfig, BodyConfig } from '../physics/types.js'

const world: WorldConfig = {
  width: 1200, height: 800,
  walls: [
    { x1: 0, y1: 0, x2: 1200, y2: 0, type: 'bounce' },
    { x1: 1200, y1: 0, x2: 1200, y2: 800, type: 'bounce' },
    { x1: 1200, y1: 800, x2: 0, y2: 800, type: 'bounce' },
    { x1: 0, y1: 800, x2: 0, y2: 0, type: 'bounce' },
  ],
}

function vehicle(overrides: Partial<BodyConfig> = {}): BodyConfig {
  return {
    id: 'v1', type: 'vehicle', shape: 'circle', radius: 20, x: 400, y: 400, angle: 0, mass: 1, restitution: 0.5, friction: 0.1, ...overrides,
  }
}

function setup() {
  const engine = new MatterPhysicsEngine()
  engine.createWorld(world)
  engine.addBody(vehicle())
  const vs = new VehicleSystem(engine)
  vs.register('v1')
  return { engine, vs }
}

describe('VehicleSystem', () => {
  it('applies forward force in heading direction (angle=0 → +x)', () => {
    const { engine, vs } = setup()
    vs.update(0, [{ vehicleId: 'v1', throttle: 1, turn: 0, boost: false }])
    engine.step(1 / 60)
    const state = engine.getBody('v1')!
    expect(state.velocityX).toBeGreaterThan(0)
  })

  it('clamps negative throttle to zero (no reverse)', () => {
    const { engine, vs } = setup()
    vs.update(0, [{ vehicleId: 'v1', throttle: -1, turn: 0, boost: false }])
    engine.step(1 / 60)
    const state = engine.getBody('v1')!
    expect(state.velocityX).toBe(0)
  })

  it('applies angular velocity when turning', () => {
    const { engine, vs } = setup()
    const before = engine.getBody('v1')!
    vs.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 1, boost: false }])
    engine.step(1 / 60)
    const after = engine.getBody('v1')!
    expect(after.angle).not.toBe(before.angle)
  })

  it('boost transitions: idle → active → recharging → idle', () => {
    const { engine, vs } = setup()
    const boost = { ...DEFAULT_BOOST_CONFIG, durationMs: 100, cooldownMs: 100 }

    vs.register('v1', DEFAULT_VEHICLE_CONFIG, boost)

    // Start boost
    vs.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: true }])
    expect(vs.getBoostState('v1')).toBe('active')
    vs.update(50, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: true }])
    expect(vs.getBoostProgress('v1')).toBeGreaterThan(0)
    expect(vs.getBoostProgress('v1')).toBeLessThan(1)

    // Boost expires
    vs.update(150, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: false }])
    expect(vs.getBoostState('v1')).toBe('recharging')

    // Boost recharges
    vs.update(300, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: false }])
    expect(vs.getBoostState('v1')).toBe('idle')
    expect(vs.getBoostProgress('v1')).toBe(1)
  })

  it('boost multiplies speed', () => {
    const { engine, vs } = setup()
    const boost = { ...DEFAULT_BOOST_CONFIG, speedMultiplier: 2.5, durationMs: 500, cooldownMs: 500 }
    vs.register('v1', DEFAULT_VEHICLE_CONFIG, boost)

    // With boost
    vs.update(0, [{ vehicleId: 'v1', throttle: 1, turn: 0, boost: true }])
    engine.step(1 / 60)
    const boosted = engine.getBody('v1')!
    const boostedSpeed = Math.sqrt(boosted.velocityX ** 2 + boosted.velocityY ** 2)

    // Without boost (reset)
    const engine2 = new MatterPhysicsEngine()
    engine2.createWorld(world)
    engine2.addBody(vehicle())
    const vs2 = new VehicleSystem(engine2)
    vs2.register('v1', DEFAULT_VEHICLE_CONFIG, boost)
    vs2.update(0, [{ vehicleId: 'v1', throttle: 1, turn: 0, boost: false }])
    engine2.step(1 / 60)
    const normal = engine2.getBody('v1')!
    const normalSpeed = Math.sqrt(normal.velocityX ** 2 + normal.velocityY ** 2)

    expect(boostedSpeed).toBeGreaterThan(normalSpeed * 2)
  })

  it('boost reduces turn rate', () => {
    const { engine, vs } = setup()
    const boost = { ...DEFAULT_BOOST_CONFIG, turnRateMultiplier: 0.5, durationMs: 500, cooldownMs: 500 }
    vs.register('v1', DEFAULT_VEHICLE_CONFIG, boost)

    // With boost + turn
    vs.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 1, boost: true }])
    engine.step(1 / 60)
    const after = engine.getBody('v1')!
    const boostedTurn = after.angle

    // Without boost (reset)
    const engine2 = new MatterPhysicsEngine()
    engine2.createWorld(world)
    engine2.addBody(vehicle())
    const vs2 = new VehicleSystem(engine2)
    vs2.register('v1', DEFAULT_VEHICLE_CONFIG, boost)
    vs2.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 1, boost: false }])
    engine2.step(1 / 60)
    const normal = engine2.getBody('v1')!

    expect(Math.abs(boostedTurn)).toBeLessThan(Math.abs(normal.angle))
  })

  it('returns undefined boost state for unknown vehicle', () => {
    const { vs } = setup()
    expect(vs.getBoostState('unknown')).toBeUndefined()
  })

  it('applies friction deceleration when throttle is zero', () => {
    const { engine, vs } = setup()
    engine.setBodyVelocity('v1', { x: 10, y: 0 })
    vs.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: false }])
    engine.step(1 / 60)
    const state = engine.getBody('v1')!
    expect(state.velocityX).toBeLessThan(10)
  })
})
