import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import type { BodyId } from '../physics/types.js'
import type { VehicleCommand } from '../input/VehicleCommand.js'
import type { BoostConfig } from '../config/boost-config.js'
import { DEFAULT_BOOST_CONFIG } from '../config/boost-config.js'
import { createBoostState, updateBoostPhase } from '../state/BoostState.js'
import type { BoostPhase, BoostState } from '../state/BoostState.js'

export interface VehicleConfig {
  maxForce: number
  maxTurnSpeed: number
  baseFrictionAir: number
}

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  maxForce: 0.05,
  maxTurnSpeed: 0.08,
  baseFrictionAir: 0.02,
}

export class VehicleSystem {
  private engine: IPhysicsEngine
  private bodies: Map<BodyId, { config: VehicleConfig; boost: BoostConfig; boostState: BoostState }> = new Map()
  private timestamps: Map<BodyId, number> = new Map()
  private zoneMods: Map<BodyId, { frictionMul: number; maxSpeedMul: number; turnMul: number }> = new Map()
  private baseMaxSpeed = 20

  constructor(engine: IPhysicsEngine) {
    this.engine = engine
  }

  register(id: BodyId, config?: VehicleConfig, boost?: BoostConfig): void {
    this.bodies.set(id, {
      config: config ?? DEFAULT_VEHICLE_CONFIG,
      boost: boost ?? DEFAULT_BOOST_CONFIG,
      boostState: createBoostState(),
    })
    this.timestamps.set(id, 0)
  }

  unregister(id: BodyId): void {
    this.bodies.delete(id)
    this.timestamps.delete(id)
    this.zoneMods.delete(id)
  }

  getBoostState(id: BodyId): BoostPhase | undefined {
    return this.bodies.get(id)?.boostState.phase
  }

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

  setZoneModifiers(vehicleId: BodyId, frictionMul: number, maxSpeedMul: number, turnMul: number): void {
    this.zoneMods.set(vehicleId, { frictionMul, maxSpeedMul, turnMul })
  }

  clearZoneModifiers(vehicleId: BodyId): void {
    this.zoneMods.delete(vehicleId)
  }

  update(now: number, commands: VehicleCommand[]): void {
    for (const cmd of commands) {
      const entry = this.bodies.get(cmd.vehicleId)
      if (!entry) continue

      this.timestamps.set(cmd.vehicleId, now)
      const { config, boost, boostState } = entry
      const zoneMod = this.zoneMods.get(cmd.vehicleId)

      const phase = updateBoostPhase(boostState, now, cmd.boost, boost.durationMs, boost.cooldownMs)

      const throttle = Math.max(0, cmd.throttle) * (phase === 'active' ? boost.speedMultiplier : 1)
      let turnRate = cmd.turn * (phase === 'active' ? boost.turnRateMultiplier : 1)
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

  postStep(): void {
    for (const [id] of this.bodies) {
      const zoneMod = this.zoneMods.get(id)
      const maxSpeed = this.baseMaxSpeed * (zoneMod?.maxSpeedMul ?? 1)

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
