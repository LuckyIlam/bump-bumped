import { EventBus } from '../events/EventBus.js'
import type { VehicleCommand } from '../input/VehicleCommand.js'
import type { MapData } from '../map/types.js'
import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import { MatterPhysicsEngine } from '../physics/MatterPhysicsEngine.js'
import type { BodyState } from '../physics/types.js'
import type { GameStateSnapshot } from '../state/GameState.js'
import { GameState } from '../state/GameState.js'
import type { BoostStatusReader } from './BoostStatusReader.js'
import { VehicleSystem } from './VehicleSystem.js'
import { ZoneSystem } from './ZoneSystem.js'

export class GameEngine {
  readonly eventBus: EventBus
  readonly engine: IPhysicsEngine
  readonly boostStatus: BoostStatusReader
  readonly zoneSystem: ZoneSystem
  readonly gameState: GameState

  private readonly vehicleSystem: VehicleSystem

  constructor(map: MapData, playerCount?: number) {
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
    this.gameState = new GameState(this.engine, this.vehicleSystem, map, undefined, playerCount, this.eventBus)

    this.gameState.startMatch()
  }

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

  getBodies(): BodyState[] {
    return this.engine.getBodies()
  }

  getSnapshot(): GameStateSnapshot {
    return this.gameState.getSnapshot()
  }

  isRoundEnded(): boolean {
    return this.gameState.isRoundEnded()
  }

  isMatchFinished(): boolean {
    return this.gameState.isMatchFinished()
  }

  startNewRound(): void {
    this.gameState.startRound()
  }
}
