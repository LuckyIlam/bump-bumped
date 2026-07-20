import { describe, expect, it } from 'vitest'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { BodyConfig, WorldConfig, ZoneSegment } from '../physics/types.js'
import { ZONE_MODIFIERS } from '../physics/types.js'
import { VehicleSystem } from '../systems/VehicleSystem.js'
import { ZoneSystem } from '../systems/ZoneSystem.js'

const world: WorldConfig = {
  width: 1200,
  height: 800,
  walls: [{ x1: 0, y1: 0, x2: 1200, y2: 0, type: 'bounce' }],
}

function vehicle(overrides: Partial<BodyConfig> = {}): BodyConfig {
  return {
    id: 'v1',
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

describe('ZoneSystem', () => {
  it('returns neutral for position outside all zones', () => {
    const zs = new ZoneSystem([])
    const mod = zs.getModifierAt(999, 999)
    expect(mod).toEqual(ZONE_MODIFIERS.neutral)
  })

  it('looks up the correct zone modifier by position', () => {
    const zones: ZoneSegment[] = [
      { x: 100, y: 100, width: 200, height: 200, type: 'grip' },
      { x: 400, y: 100, width: 200, height: 200, type: 'slick' },
    ]
    const zs = new ZoneSystem(zones)
    expect(zs.getModifierAt(150, 150)).toEqual(ZONE_MODIFIERS.grip)
    expect(zs.getModifierAt(500, 150)).toEqual(ZONE_MODIFIERS.slick)
    expect(zs.getModifierAt(999, 999)).toEqual(ZONE_MODIFIERS.neutral)
  })

  it('returns type by position', () => {
    const zones: ZoneSegment[] = [{ x: 0, y: 0, width: 100, height: 100, type: 'accelerator' }]
    const zs = new ZoneSystem(zones)
    expect(zs.getTypeAt(50, 50)).toBe('accelerator')
    expect(zs.getTypeAt(150, 150)).toBe('neutral')
  })

  it('first zone wins when zones overlap', () => {
    const zones: ZoneSegment[] = [
      { x: 0, y: 0, width: 200, height: 200, type: 'grip' },
      { x: 50, y: 50, width: 100, height: 100, type: 'slick' },
    ]
    const zs = new ZoneSystem(zones)
    expect(zs.getTypeAt(75, 75)).toBe('grip')
  })

  it('ZONE_MODIFIERS defined for all zone types', () => {
    expect(ZONE_MODIFIERS.neutral).toEqual({ frictionMultiplier: 1, maxSpeedMultiplier: 1, turnRateMultiplier: 1 })
    expect(ZONE_MODIFIERS.grip).toEqual({ frictionMultiplier: 1.5, maxSpeedMultiplier: 0.8, turnRateMultiplier: 1.3 })
    expect(ZONE_MODIFIERS.slick).toEqual({ frictionMultiplier: 0.3, maxSpeedMultiplier: 1.3, turnRateMultiplier: 0.5 })
    expect(ZONE_MODIFIERS.accelerator).toEqual({ frictionMultiplier: 1, maxSpeedMultiplier: 1.5, turnRateMultiplier: 0.7 })
  })
})

describe('VehicleSystem + ZoneSystem integration', () => {
  it('applies grip turn multiplier by position', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld({ ...world, zones: [{ x: 300, y: 300, width: 200, height: 200, type: 'grip' }] })
    engine.addBody(vehicle())
    const vs = new VehicleSystem(engine)
    vs.register('v1')

    const zs = new ZoneSystem([{ x: 300, y: 300, width: 200, height: 200, type: 'grip' }])
    const mod = zs.getModifierAt(400, 400)
    vs.setZoneModifiers('v1', mod.frictionMultiplier, mod.maxSpeedMultiplier, mod.turnRateMultiplier)

    vs.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 1, boost: false }])
    engine.step(1000 / 60)
    const gripState = engine.getBody('v1')!

    // Compare with neutral zone
    const engine2 = new MatterPhysicsEngine()
    engine2.createWorld(world)
    engine2.addBody(vehicle())
    const vs2 = new VehicleSystem(engine2)
    vs2.register('v1')
    vs2.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 1, boost: false }])
    engine2.step(1000 / 60)
    const neutralState = engine2.getBody('v1')!

    expect(Math.abs(gripState.angle)).toBeGreaterThan(Math.abs(neutralState.angle))
  })

  it('applies friction multiplier from zone', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(world)
    engine.addBody(vehicle())
    const vs = new VehicleSystem(engine)
    vs.register('v1')

    engine.setBodyVelocity('v1', { x: 10, y: 0 })
    vs.setZoneModifiers('v1', 0.3, 1, 1) // slick zone
    vs.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: false }])
    engine.step(1000 / 60)
    const slickState = engine.getBody('v1')!

    // Neutral zone (friction = 1)
    const engine2 = new MatterPhysicsEngine()
    engine2.createWorld(world)
    engine2.addBody(vehicle())
    const vs2 = new VehicleSystem(engine2)
    vs2.register('v1')
    engine2.setBodyVelocity('v1', { x: 10, y: 0 })
    vs2.update(0, [{ vehicleId: 'v1', throttle: 0, turn: 0, boost: false }])
    engine2.step(1000 / 60)
    const neutralState = engine2.getBody('v1')!

    // With less friction, slick zone should maintain more speed
    expect(slickState.velocityX).toBeGreaterThan(neutralState.velocityX)
  })

  it('clamps speed with postStep based on zone max speed', () => {
    const engine = new MatterPhysicsEngine()
    engine.createWorld(world)
    engine.addBody(vehicle())
    const vs = new VehicleSystem(engine)
    vs.register('v1')

    vs.setZoneModifiers('v1', 1, 0.5, 1)
    engine.setBodyVelocity('v1', { x: 100, y: 0 })
    engine.step(1000 / 60)
    vs.postStep()
    const state = engine.getBody('v1')!
    expect(Math.abs(state.velocityX)).toBeLessThan(25)
  })
})
