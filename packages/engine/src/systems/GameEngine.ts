import { EventBus } from '../events/EventBus.js'
import type { VehicleCommand } from '../input/VehicleCommand.js'
import type { MapData } from '../map/types.js'
import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { BodyState } from '../physics/types.js'
import type { GameStateSnapshot, ShapeRandomizer } from '../state/GameState.js'
import { GameState } from '../state/GameState.js'
import type { BoostStatusReader } from './BoostStatusReader.js'
import { VehicleSystem } from './VehicleSystem.js'
import { ZoneSystem } from './ZoneSystem.js'

export class GameEngine {
  /** Shared event bus for engine → client communication. */
  readonly eventBus: EventBus
  /** Physics engine backing the simulation. */
  readonly engine: IPhysicsEngine
  /** Narrow interface for reading boost state (ISP). */
  readonly boostStatus: BoostStatusReader
  /** Zone system for area-based modifiers. */
  readonly zoneSystem: ZoneSystem
  /** Game state managing rounds, elimination, and scoring. */
  readonly gameState: GameState

  private readonly vehicleSystem: VehicleSystem

  /**
   * Composition root — creates all engine subsystems and wires them together.
   * @param map - Parsed map data (walls, spawns, pockets, zones).
   * @param playerCount - Number of players (defaults to map spawn count).
   * @param randomizer - Optional shape randomizer (uses Math.random when omitted).
   */
  constructor(map: MapData, playerCount?: number, randomizer?: ShapeRandomizer) {
    this.eventBus = new EventBus()

    this.engine = new MatterPhysicsEngine()
    this.engine.createWorld({
      width: map.width,
      height: map.height,
      walls: map.walls,
      zones: map.zones,
    })

    this.vehicleSystem = new VehicleSystem(this.engine, this.eventBus)
    this.boostStatus = this.vehicleSystem
    this.zoneSystem = new ZoneSystem(map.zones)
    this.gameState = new GameState(this.engine, this.vehicleSystem, map, randomizer, playerCount, this.eventBus)

    this.gameState.startMatch()
  }

  /**
   * Advances the simulation by one fixed-step tick.
   * Order: vehicle commands → physics step → speed clamp → zone updates → state checks.
   */
  step(now: number, delta: number, commands: VehicleCommand[]): void {
    this.vehicleSystem.update(now, commands)
    this.engine.step(delta)
    this.vehicleSystem.postStep()
    this.updateZones()
    this.gameState.update(now, delta)
  }

  private updateZones(): void {
    for (const state of this.engine.getBodies()) {
      const mod = this.zoneSystem.getModifierAt(state.x, state.y)
      this.vehicleSystem.setZoneModifiers(state.id, mod.frictionMultiplier, mod.maxSpeedMultiplier, mod.turnRateMultiplier)
    }
  }

  /** Returns current body states from the physics engine (for rendering). */
  getBodies(): BodyState[] {
    return this.engine.getBodies()
  }

  /** Returns a defensive snapshot of the current game state (for HUD, round-end overlay). */
  getSnapshot(): GameStateSnapshot {
    return this.gameState.getSnapshot()
  }

  /** Returns true when the current round has ended. */
  isRoundEnded(): boolean {
    return this.gameState.isRoundEnded()
  }

  /** Returns true when the entire match is finished (or winner decided). */
  isMatchFinished(): boolean {
    return this.gameState.isMatchFinished()
  }

  /** Starts a new round (respawns all players, resets collision data). */
  startNewRound(): void {
    this.gameState.startRound()
  }

  /** Releases all resources held by the engine (physics world, event listeners, etc.). */
  cleanup(): void {
    this.engine.destroy()
  }
}
