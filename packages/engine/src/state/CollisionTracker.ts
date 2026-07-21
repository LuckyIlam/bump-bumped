import type { EventBus } from '../events/EventBus.js'
import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import type { BodyId, CollisionEvent } from '../physics/types.js'

export class CollisionTracker {
  private wallBounceCounts = new Map<BodyId, number>()
  private lastVehicleHit = new Map<BodyId, BodyId | null>()
  private knownVehicles = new Set<BodyId>()

  constructor(
    engine: IPhysicsEngine,
    private eventBus?: EventBus,
  ) {
    engine.onCollision((event: CollisionEvent) => {
      this.handleCollision(event)
    })
  }

  setVehicles(ids: BodyId[]): void {
    this.knownVehicles = new Set(ids)
  }

  getBounceCount(bodyId: BodyId): number {
    return this.wallBounceCounts.get(bodyId) ?? 0
  }

  getLastHitter(bodyId: BodyId): BodyId | null {
    return this.lastVehicleHit.get(bodyId) ?? null
  }

  clear(): void {
    this.wallBounceCounts.clear()
    this.lastVehicleHit.clear()
  }

  private handleCollision(event: CollisionEvent): void {
    const { bodyA, bodyB } = event
    const aIsVehicle = this.knownVehicles.has(bodyA)
    const bIsVehicle = this.knownVehicles.has(bodyB)
    const aIsWall = bodyA === 'wall'
    const bIsWall = bodyB === 'wall'

    if (aIsVehicle && bIsWall) {
      this.wallBounceCounts.set(bodyA, (this.wallBounceCounts.get(bodyA) ?? 0) + 1)
      this.eventBus?.emit({ type: 'wallBounce', bodyId: bodyA })
    } else if (bIsVehicle && aIsWall) {
      this.wallBounceCounts.set(bodyB, (this.wallBounceCounts.get(bodyB) ?? 0) + 1)
      this.eventBus?.emit({ type: 'wallBounce', bodyId: bodyB })
    } else if (aIsVehicle && bIsVehicle) {
      this.lastVehicleHit.set(bodyA, bodyB)
      this.lastVehicleHit.set(bodyB, bodyA)
      this.eventBus?.emit({ type: 'vehicleCollision', bodyA, bodyB, relativeVelocity: event.relativeVelocity })
    }
  }
}
