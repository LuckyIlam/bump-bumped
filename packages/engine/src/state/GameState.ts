import { BODY_FRICTION, BODY_MASS, BODY_RESTITUTION, VEHICLE_RADIUS } from '../config/game-config.js'
import type { EventBus } from '../events/EventBus.js'
import type { MapData } from '../map/types.js'
import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import type { BodyId, VehicleShape } from '../physics/types.js'
import type { VehicleSystem } from '../systems/VehicleSystem.js'
import { CollisionTracker } from './CollisionTracker.js'
import { ScoringService } from './ScoringService.js'
import { vehicleId } from './VehicleId.js'

const VEHICLE_SHAPES: VehicleShape[] = ['circle', 'square', 'diamond', 'hexagon']

export type RoundPhase = 'countdown' | 'playing' | 'ended'
export type MatchPhase = 'playing' | 'tiebreaker' | 'finished'

export interface PlayerState {
  id: BodyId
  index: number
  colorIndex: number
  shape: VehicleShape
  alive: boolean
  score: number
  roundScore: number
  eliminationOrder: number
}

export interface RoundState {
  phase: RoundPhase
  number: number
  aliveCount: number
  eliminationOrder: BodyId[]
  winner: BodyId | null
}

export interface MatchState {
  currentRound: number
  totalRounds: number
  phase: MatchPhase
  winner: BodyId | null
}

export interface GameStateSnapshot {
  match: MatchState
  round: RoundState
  players: PlayerState[]
}

export type ShapeRandomizer = () => VehicleShape

function defaultRandomizer(): VehicleShape {
  return VEHICLE_SHAPES[Math.floor(Math.random() * VEHICLE_SHAPES.length)]
}

export class GameState {
  private players: PlayerState[] = []
  private round: RoundState
  private match: MatchState
  private engine: IPhysicsEngine
  private vehicleSystem: VehicleSystem
  private map: MapData
  private randomizer: ShapeRandomizer
  private eventBus?: EventBus
  private collisionTracker: CollisionTracker
  private scoringService = new ScoringService()
  private roundNumber = 0

  private playerCount: number

  constructor(
    engine: IPhysicsEngine,
    vehicleSystem: VehicleSystem,
    map: MapData,
    randomizer?: ShapeRandomizer,
    playerCount?: number,
    eventBus?: EventBus,
  ) {
    this.engine = engine
    this.vehicleSystem = vehicleSystem
    this.map = map
    this.randomizer = randomizer ?? defaultRandomizer
    this.playerCount = playerCount ?? map.spawns.length
    this.eventBus = eventBus
    this.collisionTracker = new CollisionTracker(engine, eventBus)

    this.match = {
      currentRound: 0,
      totalRounds: 3,
      phase: 'playing',
      winner: null,
    }

    this.round = {
      phase: 'ended',
      number: 0,
      aliveCount: 0,
      eliminationOrder: [],
      winner: null,
    }
  }

  startMatch(): void {
    this.match = {
      currentRound: 0,
      totalRounds: 3,
      phase: 'playing',
      winner: null,
    }

    this.players = []
    for (let i = 0; i < this.playerCount; i++) {
      this.players.push({
        id: vehicleId(i),
        index: i,
        colorIndex: i,
        shape: 'circle',
        alive: false,
        score: 0,
        roundScore: 0,
        eliminationOrder: 0,
      })
    }

    this.roundNumber = 0
    this.startRound()
  }

  startRound(): void {
    this.roundNumber++
    this.match.currentRound = this.roundNumber

    for (const player of this.players) {
      this.engine.removeBody(player.id)
      this.vehicleSystem.unregister(player.id)
    }

    this.collisionTracker.clear()

    this.round = {
      phase: 'playing',
      number: this.roundNumber,
      aliveCount: this.players.length,
      eliminationOrder: [],
      winner: null,
    }

    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      const spawn = this.map.spawns[i]
      if (!spawn) continue

      const shape = this.randomizer()
      player.shape = shape
      player.alive = true
      player.roundScore = 0
      player.eliminationOrder = 0

      this.engine.addBody({
        id: player.id,
        type: 'vehicle',
        shape,
        radius: VEHICLE_RADIUS,
        x: spawn.x,
        y: spawn.y,
        angle: (spawn.angle * Math.PI) / 180,
        mass: BODY_MASS,
        restitution: BODY_RESTITUTION,
        friction: BODY_FRICTION,
      })
      this.vehicleSystem.register(player.id)
    }

    this.collisionTracker.setVehicles(this.players.map((p) => p.id))
  }

  update(_now: number, _delta: number): void {
    if (this.round.phase !== 'playing') return
    this.checkPockets()
    this.checkRoundEnd()
  }

  private checkPockets(): void {
    const pockets = this.map.pockets
    const bodies = this.engine.getBodies()

    for (const player of this.players) {
      if (!player.alive) continue
      const body = bodies.find((b) => b.id === player.id)
      if (!body) continue

      for (const pocket of pockets) {
        const dx = body.x - pocket.x
        const dy = body.y - pocket.y
        if (Math.sqrt(dx * dx + dy * dy) < pocket.radius) {
          this.eliminate(player.id)
          break
        }
      }
    }
  }

  private eliminate(bodyId: BodyId): void {
    const player = this.players.find((p) => p.id === bodyId)
    if (!player?.alive) return

    const bodyState = this.engine.getBody(bodyId)
    const hitter = this.collisionTracker.getLastHitter(bodyId)
    const bounces = this.collisionTracker.getBounceCount(bodyId)

    if (hitter) {
      const hitterPlayer = this.players.find((p) => p.id === hitter)
      if (hitterPlayer) {
        const bonus = bounces >= 2 ? bounces * 2 : 0
        hitterPlayer.score += 1 + bonus
      }
    }

    player.alive = false
    this.round.aliveCount--
    this.round.eliminationOrder.push(bodyId)
    player.eliminationOrder = this.round.eliminationOrder.length

    this.eventBus?.emit({
      type: 'elimination',
      bodyId,
      hitter,
      bounces,
      position: bodyState ? { x: bodyState.x, y: bodyState.y } : { x: 0, y: 0 },
      shape: player.shape,
      colorIndex: player.colorIndex,
    })

    this.engine.removeBody(bodyId)
    this.vehicleSystem.unregister(bodyId)
  }

  private checkRoundEnd(): void {
    if (this.round.aliveCount <= 1) {
      this.endRound()
    }
  }

  private endRound(): void {
    this.round.phase = 'ended'

    const alive = this.players.find((p) => p.alive)
    if (alive) {
      this.round.winner = alive.id
    } else if (this.round.eliminationOrder.length > 0) {
      this.round.winner = this.round.eliminationOrder[this.round.eliminationOrder.length - 1]
    }

    this.awardPoints()
    this.checkMatchEnd()

    this.eventBus?.emit({ type: 'roundEnd', snapshot: this.getSnapshot() })
  }

  private awardPoints(): void {
    this.scoringService.awardRoundScores(this.players, this.round.eliminationOrder, this.collisionTracker)
  }

  private checkMatchEnd(): void {
    if (this.match.phase === 'tiebreaker') {
      this.match.phase = 'finished'
      const sorted = [...this.players].sort((a, b) => b.score - a.score)
      this.match.winner = sorted[0].id
      this.eventBus?.emit({ type: 'matchEnd', winner: this.match.winner })
      return
    }

    if (this.roundNumber >= this.match.totalRounds) {
      const sorted = [...this.players].sort((a, b) => b.score - a.score)
      const topScore = sorted[0].score
      const tied = sorted.filter((p) => p.score === topScore)

      if (tied.length >= 2) {
        this.match.phase = 'tiebreaker'
      } else {
        this.match.phase = 'finished'
        this.match.winner = sorted[0].id
        this.eventBus?.emit({ type: 'matchEnd', winner: this.match.winner })
      }
    }
  }

  isRoundEnded(): boolean {
    return this.round.phase === 'ended'
  }

  isMatchFinished(): boolean {
    return this.match.phase === 'finished'
  }

  needsTiebreaker(): boolean {
    return this.match.phase === 'tiebreaker'
  }

  getSnapshot(): GameStateSnapshot {
    return {
      match: { ...this.match },
      round: { ...this.round, eliminationOrder: [...this.round.eliminationOrder] },
      players: this.players.map((p) => ({ ...p })),
    }
  }
}
