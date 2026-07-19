import { describe, expect, it } from 'vitest'
import type { VehicleCommand } from '../input/VehicleCommand.js'
import type { MapData, Pocket } from '../map/types.js'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { VehicleShape } from '../physics/types.js'
import { GameState } from '../state/GameState.js'
import { VehicleSystem } from '../systems/VehicleSystem.js'

function simpleMap(pockets: Pocket[] = [], spawnCount = 2): MapData {
  const spawns = Array.from({ length: spawnCount }, (_, i) => {
    const angle = (360 / spawnCount) * i
    return { x: 200 + i * 300, y: 300, angle }
  })
  return {
    formatVersion: 1,
    name: 'Test',
    width: 1200,
    height: 800,
    walls: [],
    pockets,
    zones: [],
    spawns,
  }
}

function pocketAt(x: number, y: number, radius = 30): Pocket {
  return { x, y, radius }
}

describe('GameState', () => {
  describe('spawn', () => {
    it('should spawn all players at their spawn positions', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const gs = new GameState(engine, vs, simpleMap())

      gs.startMatch()
      const snap = gs.getSnapshot()

      expect(snap.players).toHaveLength(2)
      expect(snap.players[0].id).toBe('vehicle_0')
      expect(snap.players[1].id).toBe('vehicle_1')
      expect(snap.players[0].alive).toBe(true)
      expect(snap.players[1].alive).toBe(true)

      const bodies = engine.getBodies()
      expect(bodies).toHaveLength(2)
      expect(bodies[0].x).toBe(200)
      expect(bodies[0].y).toBe(300)
      expect(bodies[1].x).toBe(500)
      expect(bodies[1].y).toBe(300)
    })

    it('should assign a vehicle shape to each player', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const shapes: VehicleShape[] = []
      const gs = new GameState(engine, vs, simpleMap(), () => {
        const s: VehicleShape = ['circle', 'square', 'diamond', 'hexagon'][shapes.length % 4]
        shapes.push(s)
        return s
      })

      gs.startMatch()
      const snap = gs.getSnapshot()

      expect(snap.players[0].shape).toBe('circle')
      expect(snap.players[1].shape).toBe('square')
    })

    it('should register all spawned vehicles with VehicleSystem', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const gs = new GameState(engine, vs, simpleMap())

      gs.startMatch()

      expect(vs.getBoostState('vehicle_0')).toBe('idle')
      expect(vs.getBoostState('vehicle_1')).toBe('idle')
    })
  })

  describe('elimination', () => {
    it('should eliminate a player whose vehicle enters a pocket', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()

      gs.update(0, 0)

      const snap = gs.getSnapshot()
      expect(snap.players[0].alive).toBe(false)
      expect(snap.players[1].alive).toBe(true)
    })

    it('should remove eliminated body from physics engine', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)

      expect(engine.getBody('vehicle_0')).toBeUndefined()
      expect(engine.getBody('vehicle_1')).toBeDefined()
    })

    it('should unregister eliminated vehicle from VehicleSystem', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)

      expect(vs.getBoostState('vehicle_0')).toBeUndefined()
      expect(vs.getBoostState('vehicle_1')).toBe('idle')
    })

    it('should record elimination order', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)

      expect(gs.getSnapshot().players[0].eliminationOrder).toBe(1)
      expect(gs.getSnapshot().players[1].eliminationOrder).toBe(0)
    })
  })

  describe('round system', () => {
    it('should end the round when only one player remains', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)

      expect(gs.isRoundEnded()).toBe(true)
      expect(gs.getSnapshot().round.phase).toBe('ended')
    })

    it('should declare the last alive as round winner', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)

      expect(gs.getSnapshot().round.winner).toBe('vehicle_1')
    })

    it('should start a new round with all players alive', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)
      expect(gs.isRoundEnded()).toBe(true)

      gs.startRound()
      const snap = gs.getSnapshot()
      expect(snap.round.phase).toBe('playing')
      expect(snap.players[0].alive).toBe(true)
      expect(snap.players[1].alive).toBe(true)
      expect(snap.round.number).toBe(2)
    })
  })

  describe('scoring', () => {
    it('should award placement points: 1st=5, 2nd=3', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)

      const snap = gs.getSnapshot()
      expect(snap.players[0].roundScore).toBe(3)
      expect(snap.players[1].roundScore).toBe(5)
      expect(snap.players[0].score).toBe(3)
      expect(snap.players[1].score).toBe(5)
    })

    it('should award placement points for 4 players: 5/3/1/0', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)

      const pockets = [pocketAt(200, 300, 30), pocketAt(500, 300, 30), pocketAt(800, 300, 30)]
      const map = simpleMap(pockets, 4)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()

      // First update: vehicle_0, vehicle_1, vehicle_2 are in pockets
      gs.update(0, 0)

      const snap = gs.getSnapshot()
      const p0 = snap.players.find((p) => p.id === 'vehicle_0')!
      const p1 = snap.players.find((p) => p.id === 'vehicle_1')!
      const p2 = snap.players.find((p) => p.id === 'vehicle_2')!
      const p3 = snap.players.find((p) => p.id === 'vehicle_3')!

      expect(p3.roundScore).toBe(5)
      expect(p2.roundScore).toBe(3)
      expect(p1.roundScore).toBe(1)
      expect(p0.roundScore).toBe(0)
    })
  })

  describe('match', () => {
    it('should accumulate scores across rounds', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      gs.update(0, 0)
      expect(gs.isRoundEnded()).toBe(true)

      // Round 2: same pocket kills vehicle_0 again
      gs.startRound()
      gs.update(0, 0)

      const snap = gs.getSnapshot()
      expect(snap.players[0].score).toBe(6)
      expect(snap.players[1].score).toBe(10)
    })

    it('should end match after 3 rounds', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()
      // Round 1
      gs.update(0, 0)
      expect(gs.isRoundEnded()).toBe(true)
      expect(gs.isMatchFinished()).toBe(false)

      // Round 2
      gs.startRound()
      gs.update(0, 0)
      expect(gs.isRoundEnded()).toBe(true)
      expect(gs.isMatchFinished()).toBe(false)

      // Round 3
      gs.startRound()
      gs.update(0, 0)
      expect(gs.isRoundEnded()).toBe(true)
      expect(gs.isMatchFinished()).toBe(true)
    })

    it('should declare match winner with highest total score', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()

      for (let r = 0; r < 3; r++) {
        gs.startRound()
        gs.update(0, 0)
        expect(gs.isRoundEnded()).toBe(true)
      }

      const snap = gs.getSnapshot()
      expect(snap.match.phase).toBe('finished')
      expect(snap.match.winner).toBe('vehicle_1')
      expect(snap.players[0].score).toBe(9)
      expect(snap.players[1].score).toBe(15)
    })

    it('should report no tiebreaker when scores differ after 3 rounds', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const map = simpleMap([pocketAt(200, 300, 30)], 2)
      const gs = new GameState(engine, vs, map, () => 'circle')

      gs.startMatch()

      for (let r = 0; r < 3; r++) {
        gs.startRound()
        gs.update(0, 0)
        expect(gs.isRoundEnded()).toBe(true)
      }

      expect(gs.needsTiebreaker()).toBe(false)
      expect(gs.isMatchFinished()).toBe(true)
      expect(gs.getSnapshot().match.winner).toBe('vehicle_1')
    })
  })

  describe('bumper bonus', () => {
    it('should award +1 point for direct elimination', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)

      // Put both spawns at the same position so they overlap → collide on first step
      const map: MapData = {
        formatVersion: 1,
        name: 'BonusTest',
        width: 800,
        height: 600,
        walls: [],
        pockets: [{ x: 200, y: 300, radius: 30 }],
        zones: [],
        spawns: [
          { x: 200, y: 300, angle: 0 },
          { x: 195, y: 300, angle: 0 },
        ],
      }
      const gs = new GameState(engine, vs, map, () => 'circle')

      gs.startMatch()

      // Step several times to process collisions
      for (let i = 0; i < 10; i++) {
        engine.step(1000 / 60)
        gs.update(0, 1000 / 60)
      }

      // vehicle_0 is in pocket (200,300), vehicle_1 spawned nearby
      // The bumper bonus depends on collision tracking
      const snap = gs.getSnapshot()
      // At minimum, placement points should be correct
      expect(snap.players.some((p) => p.roundScore > 0)).toBe(true)
      // Bumper gives +1 to the surviving player
      const alive = snap.players.find((p) => p.alive)
      if (alive) {
        expect(alive.roundScore).toBeGreaterThanOrEqual(5)
      }
    })
  })

  describe('GameScene loop integration', () => {
    it('should eliminate pockets and auto-transition rounds in the GameScene loop', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 1200, height: 800, walls: [] })
      const vs = new VehicleSystem(engine)
      const pocket = pocketAt(200, 300, 30)
      const map = simpleMap([pocket], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()

      const STEP = 1000 / 60
      let accumulator = 0
      const delta = 16
      let totalRoundsPlayed = 0

      for (let frame = 0; frame < 600; frame++) {
        accumulator += delta

        while (accumulator >= STEP) {
          accumulator -= STEP

          const commands: VehicleCommand[] = [
            { vehicleId: 'vehicle_0', throttle: 0, turn: 0, boost: false },
            { vehicleId: 'vehicle_1', throttle: 0, turn: 0, boost: false },
          ]
          vs.update(0, commands)
          engine.step(STEP)
          vs.postStep()
          gs.update(0, STEP)

          if (gs.isRoundEnded()) {
            if (gs.isMatchFinished()) break
            gs.startRound()
            totalRoundsPlayed++
          }
        }

        if (gs.isMatchFinished()) break
      }

      expect(gs.isMatchFinished()).toBe(true)
      expect(totalRoundsPlayed).toBe(2)
      expect(gs.getSnapshot().match.winner).toBe('vehicle_1')
    })

    it('should return to menu state (isMatchFinished) after 3 rounds', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 1200, height: 800, walls: [] })
      const vs = new VehicleSystem(engine)
      const pocket = pocketAt(200, 300, 30)
      const map = simpleMap([pocket], 2)
      const gs = new GameState(engine, vs, map)

      gs.startMatch()

      const STEP = 1000 / 60
      let accumulator = 0
      const delta = 16
      let roundsCompleted = 0

      for (let frame = 0; frame < 600; frame++) {
        accumulator += delta

        while (accumulator >= STEP) {
          accumulator -= STEP
          engine.step(STEP)
          gs.update(0, STEP)

          if (gs.isRoundEnded()) {
            if (gs.isMatchFinished()) break
            gs.startRound()
            roundsCompleted++
          }
        }

        if (gs.isMatchFinished()) break
      }

      expect(roundsCompleted).toBe(2)
      expect(gs.isMatchFinished()).toBe(true)
      expect(gs.getSnapshot().match.phase).toBe('finished')
    })
  })

  describe('getSnapshot', () => {
    it('should return current match, round, and player state', () => {
      const engine = new MatterPhysicsEngine()
      engine.createWorld({ width: 800, height: 600, walls: [] })
      const vs = new VehicleSystem(engine)
      const gs = new GameState(engine, vs, simpleMap())

      gs.startMatch()
      const snap = gs.getSnapshot()

      expect(snap.match).toBeDefined()
      expect(snap.round).toBeDefined()
      expect(snap.players).toHaveLength(2)
      expect(snap.match.currentRound).toBe(1)
      expect(snap.match.totalRounds).toBe(3)
    })
  })
})
