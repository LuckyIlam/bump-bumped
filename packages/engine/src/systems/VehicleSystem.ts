import type { BoostConfig } from '../config/boost-config.js'
import { DEFAULT_BOOST_CONFIG } from '../config/boost-config.js'
import { VEHICLE_BASE_FRICTION_AIR, VEHICLE_BASE_MAX_SPEED, VEHICLE_MAX_FORCE, VEHICLE_MAX_TURN_SPEED } from '../config/game-config.js'
import type { EventBus } from '../events/EventBus.js'
import type { VehicleCommand } from '../input/VehicleCommand.js'
import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import type { BodyId } from '../physics/types.js'
import type { BoostPhase, BoostState } from '../state/BoostState.js'
import { createBoostState, updateBoostPhase } from '../state/BoostState.js'
import type { BoostStatusReader } from './BoostStatusReader.js'

export interface VehicleConfig {
  maxForce: number
  maxTurnSpeed: number
  baseFrictionAir: number
}

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  maxForce: VEHICLE_MAX_FORCE,
  maxTurnSpeed: VEHICLE_MAX_TURN_SPEED,
  baseFrictionAir: VEHICLE_BASE_FRICTION_AIR,
}

export class VehicleSystem implements BoostStatusReader {
  private engine: IPhysicsEngine
  private eventBus?: EventBus
  private bodies: Map<BodyId, { config: VehicleConfig; boost: BoostConfig; boostState: BoostState }> = new Map()
  private timestamps: Map<BodyId, number> = new Map()
  private zoneMods: Map<BodyId, { frictionMul: number; maxSpeedMul: number; turnMul: number }> = new Map()

  /**
   * @param engine - Physics engine for applying forces and reading body state.
   * @param eventBus - Optional bus for emitting boost activation events.
   */
  constructor(engine: IPhysicsEngine, eventBus?: EventBus) {
    this.engine = engine
    this.eventBus = eventBus
  }

  /**
   * Registers a vehicle so it can receive commands and boost updates.
   * @param id - Unique vehicle identifier.
   * @param config - Optional custom vehicle config (default config used when omitted).
   * @param boost - Optional custom boost config (default config used when omitted).
   */
  register(id: BodyId, config?: VehicleConfig, boost?: BoostConfig): void {
    this.bodies.set(id, {
      config: config ?? DEFAULT_VEHICLE_CONFIG,
      boost: boost ?? DEFAULT_BOOST_CONFIG,
      boostState: createBoostState(),
    })
    this.timestamps.set(id, 0)
  }

  /** Removes a vehicle from the system (clears boost state, timestamps, zone mods). */
  unregister(id: BodyId): void {
    this.bodies.delete(id)
    this.timestamps.delete(id)
    this.zoneMods.delete(id)
  }

  /**
   * Returns the current boost phase for a vehicle.
   * @returns 'idle', 'active', 'recharging', or undefined if the vehicle is not registered.
   */
  getBoostState(id: BodyId): BoostPhase | undefined {
    return this.bodies.get(id)?.boostState.phase
  }

  /**
   * Returns boost progress as a normalised 0‑1 value.
   * - active  : fraction of duration elapsed.
   * - recharging : fraction of cooldown elapsed.
   * - idle : 1 (fully charged).
   */
  getBoostProgress(id: BodyId): number {
    const entry = this.bodies.get(id)
    if (!entry) return 0
    const { boostState, boost } = entry
    const now = this.timestamps.get(id) ?? 0

    if (boostState.phase === 'active') {
      const elapsed = now - (boostState.activeUntil - boost.durationMs)
      return Math.min(elapsed / boost.durationMs, 1)
    }
    if (boostState.phase === 'recharging') {
      const elapsed = now - (boostState.rechargedAt - boost.cooldownMs)
      return Math.min(elapsed / boost.cooldownMs, 1)
    }
    return 1
  }

  /**
   * Applies zone-based multipliers that override a vehicle's default physics.
   * Called each frame while the vehicle is inside a zone.
   */
  setZoneModifiers(vehicleId: BodyId, frictionMul: number, maxSpeedMul: number, turnMul: number): void {
    this.zoneMods.set(vehicleId, { frictionMul, maxSpeedMul, turnMul })
  }

  /** Removes zone modifiers for a vehicle (called when it leaves a zone). */
  clearZoneModifiers(vehicleId: BodyId): void {
    this.zoneMods.delete(vehicleId)
  }

  /**
   * Applies vehicle commands (throttle, turn, boost) for the current frame.
   * Emits a boostActivation event when boost transitions from idle to active.
   * @param now - Current time in ms (used for boost timestamps).
   * @param commands - List of commands, one per vehicle.
   */
  update(now: number, commands: VehicleCommand[]): void {
    for (const cmd of commands) {
      const entry = this.bodies.get(cmd.vehicleId)
      if (!entry) continue

      this.timestamps.set(cmd.vehicleId, now)
      const { config, boost, boostState } = entry
      const zoneMod = this.zoneMods.get(cmd.vehicleId)

      const prevPhase = boostState.phase
      entry.boostState = updateBoostPhase(boostState, now, cmd.boost, boost.durationMs, boost.cooldownMs)
      const newPhase = entry.boostState.phase

      if (prevPhase !== 'active' && newPhase === 'active') {
        this.eventBus?.emit({ type: 'boostActivation', bodyId: cmd.vehicleId })
      }

      const throttle = Math.max(0, cmd.throttle) * (newPhase === 'active' ? boost.speedMultiplier : 1)
      let turnRate = cmd.turn * (newPhase === 'active' ? boost.turnRateMultiplier : 1)
      turnRate = Math.max(-1, Math.min(1, turnRate)) * (zoneMod?.turnMul ?? 1)

      const state = this.engine.getBody(cmd.vehicleId)
      if (!state) continue

      const headingX = Math.cos(state.angle)
      const headingY = Math.sin(state.angle)
      const forceMag = throttle * config.maxForce
      const frictionAir = config.baseFrictionAir * (zoneMod?.frictionMul ?? 1)

      this.engine.setFrictionAir(cmd.vehicleId, frictionAir)
      this.engine.applyForce(cmd.vehicleId, { x: headingX * forceMag, y: headingY * forceMag })
      this.engine.setAngularVelocity(cmd.vehicleId, turnRate * config.maxTurnSpeed)
    }
  }

  /**
   * Clamps each vehicle's speed to the configured maximum
   * (optionally modified by zone multipliers). Must be called
   * after each physics step.
   */
  postStep(): void {
    for (const [id] of this.bodies) {
      const zoneMod = this.zoneMods.get(id)
      const maxSpeed = VEHICLE_BASE_MAX_SPEED * (zoneMod?.maxSpeedMul ?? 1)

      const state = this.engine.getBody(id)
      if (!state) continue

      const speed = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2)
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed
        this.engine.setBodyVelocity(id, {
          x: state.velocityX * scale,
          y: state.velocityY * scale,
        })
      }
    }
  }
}
