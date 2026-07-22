import { describe, expect, it } from 'vitest'
import type { MapData } from '../map/types.js'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { VehicleShape } from '../physics/types.js'
import { GameEngine } from '../systems/GameEngine.js'
import { createSeededRandomizer } from '../utils/seeded-random.js'

const STEP = 1000 / 60

function simpleMap(spawnCount = 2): MapData {
  const spawns = Array.from({ length: spawnCount }, (_, i) => {
    const angle = (360 / spawnCount) * i
    const x = 100 + i * 300
    return { x, y: 200, angle }
  })
  return {
    formatVersion: 1,
    name: 'DeterminismTest',
    width: 1200,
    height: 800,
    walls: [
      { x1: 0, y1: 0, x2: 1200, y2: 0, type: 'bounce' },
      { x1: 1200, y1: 0, x2: 1200, y2: 800, type: 'bounce' },
      { x1: 1200, y1: 800, x2: 0, y2: 800, type: 'bounce' },
      { x1: 0, y1: 800, x2: 0, y2: 0, type: 'bounce' },
    ],
    pockets: [],
    zones: [],
    spawns,
  }
}

describe('14.3 — Matter.js determinism with fixed timestep', () => {
  it('should produce identical body state after two identical runs', () => {
    const run = () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 1200, height: 800, walls: simpleMap().walls })
      engine.addBody({
        id: 'v1',
        type: 'vehicle',
        shape: 'circle',
        radius: 20,
        x: 100,
        y: 400,
        angle: 0,
        mass: 1,
        restitution: 0.5,
        friction: 0.1,
      })
      engine.addBody({
        id: 'v2',
        type: 'vehicle',
        shape: 'square',
        radius: 20,
        x: 1100,
        y: 400,
        angle: Math.PI,
        mass: 1,
        restitution: 0.5,
        friction: 0.1,
      })

      for (let i = 0; i < 120; i++) {
        engine.applyForce('v1', { x: 0.03, y: 0 })
        engine.applyForce('v2', { x: -0.03, y: 0 })
        engine.step(STEP)
      }

      return engine.getBodies()
    }

    const resultA = run()
    const resultB = run()

    expect(resultA).toHaveLength(2)
    expect(resultA).toEqual(resultB)
  })
})

describe('14.2 — Seeded randomness produces consistent shape assignment', () => {
  it('should produce the same shape sequence for the same seed', () => {
    const rng1 = createSeededRandomizer(42)
    const rng2 = createSeededRandomizer(42)

    const seq1: VehicleShape[] = Array.from({ length: 20 }, () => rng1())
    const seq2: VehicleShape[] = Array.from({ length: 20 }, () => rng2())

    expect(seq1).toEqual(seq2)
  })

  it('should produce a different sequence for a different seed', () => {
    const rng1 = createSeededRandomizer(42)
    const rng2 = createSeededRandomizer(99)

    const seq1: VehicleShape[] = Array.from({ length: 20 }, () => rng1())
    const seq2: VehicleShape[] = Array.from({ length: 20 }, () => rng2())

    expect(seq1).not.toEqual(seq2)
  })

  it('should produce consistent shapes when used through GameEngine', () => {
    const run = () => {
      const engine = new GameEngine(simpleMap(2), 2, createSeededRandomizer(42))
      return engine.gameState.getSnapshot().players.map((p) => p.shape)
    }

    const shapesA = run()
    const shapesB = run()
    expect(shapesA).toEqual(shapesB)
  })
})

describe('14.1 — Integration test: same inputs → identical world state', () => {
  it('should produce identical snapshots after two identical runs with zero commands', () => {
    const run = () => {
      const ge = new GameEngine(simpleMap(2), 2, () => 'circle')

      for (let i = 0; i < 120; i++) {
        ge.step(i * STEP, STEP, [
          { vehicleId: 'vehicle_0', throttle: 0, turn: 0, boost: false },
          { vehicleId: 'vehicle_1', throttle: 0, turn: 0, boost: false },
        ])
      }

      return {
        snapshot: ge.getSnapshot(),
        bodies: ge.getBodies(),
      }
    }

    const stateA = run()
    const stateB = run()

    expect(stateA.snapshot).toEqual(stateB.snapshot)
    expect(stateA.bodies).toEqual(stateB.bodies)
  })

  it('should produce identical results with active throttle commands', () => {
    const run = () => {
      const ge = new GameEngine(simpleMap(2), 2, () => 'circle')

      for (let i = 0; i < 180; i++) {
        ge.step(i * STEP, STEP, [
          { vehicleId: 'vehicle_0', throttle: 1, turn: 0, boost: false },
          { vehicleId: 'vehicle_1', throttle: 1, turn: 0, boost: false },
        ])
      }

      return {
        snapshot: ge.getSnapshot(),
        bodies: ge.getBodies(),
      }
    }

    const stateA = run()
    const stateB = run()

    expect(stateA.snapshot).toEqual(stateB.snapshot)
    expect(stateA.bodies).toEqual(stateB.bodies)
  })

  it('should produce identical results with turn and throttle commands', () => {
    const run = () => {
      const ge = new GameEngine(simpleMap(2), 2, () => 'circle')

      for (let i = 0; i < 300; i++) {
        const turn0 = i < 30 ? 0 : 0.5
        ge.step(i * STEP, STEP, [
          { vehicleId: 'vehicle_0', throttle: 0.8, turn: turn0, boost: false },
          { vehicleId: 'vehicle_1', throttle: 0.6, turn: -0.3, boost: false },
        ])
      }

      return {
        snapshot: ge.getSnapshot(),
        bodies: ge.getBodies(),
      }
    }

    const stateA = run()
    const stateB = run()

    expect(stateA.snapshot).toEqual(stateB.snapshot)
    expect(stateA.bodies).toEqual(stateB.bodies)
  })

  it('should produce identical results across rounds with full match loop', () => {
    const pocketMap: MapData = {
      ...simpleMap(2),
      pockets: [{ x: 400, y: 400, radius: 100 }],
    }

    const run = () => {
      const ge = new GameEngine(pocketMap, 2, () => 'circle')

      for (let frame = 0; frame < 600; frame++) {
        ge.step(frame * STEP, STEP, [
          { vehicleId: 'vehicle_0', throttle: 1, turn: 0, boost: false },
          { vehicleId: 'vehicle_1', throttle: 1, turn: 0.1, boost: false },
        ])

        if (ge.isRoundEnded()) {
          if (ge.isMatchFinished()) break
          ge.startNewRound()
        }
      }

      return {
        snapshot: ge.getSnapshot(),
        bodies: ge.getBodies(),
        matchFinished: ge.isMatchFinished(),
        roundsCompleted: ge.getSnapshot().match.currentRound,
      }
    }

    const runA = run()
    const runB = run()

    expect(runA.matchFinished).toBe(true)
    expect(runA.snapshot).toEqual(runB.snapshot)
    expect(runA.bodies).toEqual(runB.bodies)
    expect(runA.roundsCompleted).toBe(runB.roundsCompleted)
  })
})
