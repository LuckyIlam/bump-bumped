import type { EventBus } from '../events/EventBus.js'
import type { IPhysicsEngine } from '../physics/IPhysicsEngine.js'
import type { BodyId, CollisionEvent } from '../physics/types.js'

export class CollisionTracker {
  private wallBounceCounts = new Map<BodyId, number>()
  private lastVehicleHit = new Map<BodyId, BodyId | null>()
  private knownVehicles = new Set<BodyId>()

  /**
   * @param engine - Physics engine to listen for collision events.
   * @param eventBus - Optional bus for emitting wallBounce and vehicleCollision events.
   */
  constructor(
    engine: IPhysicsEngine,
    private eventBus?: EventBus,
  ) {
    engine.onCollision((event: CollisionEvent) => {
      this.handleCollision(event)
    })
  }

  /** Sets the set of tracked vehicle IDs. Collisions involving other bodies are ignored. */
  setVehicles(ids: BodyId[]): void {
    this.knownVehicles = new Set(ids)
  }

  /** Returns the number of wall bounces for a vehicle this round. */
  getBounceCount(bodyId: BodyId): number {
    return this.wallBounceCounts.get(bodyId) ?? 0
  }

  /** Returns the last vehicle that collided with the given vehicle, or null. */
  getLastHitter(bodyId: BodyId): BodyId | null {
    return this.lastVehicleHit.get(bodyId) ?? null
  }

  /** Resets all bounce counts and hitter data for a new round. */
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
