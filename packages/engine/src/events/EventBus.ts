import type { BodyId, VehicleShape } from '../physics/types.js'
import type { GameStateSnapshot } from '../state/GameState.js'

export type GameEvent =
  | {
      type: 'elimination'
      bodyId: BodyId
      hitter: BodyId | null
      bounces: number
      position: { x: number; y: number }
      shape: VehicleShape
      colorIndex: number
    }
  | { type: 'vehicleCollision'; bodyA: BodyId; bodyB: BodyId; relativeVelocity: number }
  | { type: 'wallBounce'; bodyId: BodyId }
  | { type: 'boostActivation'; bodyId: BodyId }
  | { type: 'roundEnd'; snapshot: GameStateSnapshot }
  | { type: 'matchEnd'; winner: BodyId }

export type EventHandler = (event: GameEvent) => void

export class EventBus {
  private handlers: EventHandler[] = []

  /** Registers a handler for all game events. */
  on(handler: EventHandler): void {
    this.handlers.push(handler)
  }

  /** Removes a previously registered handler. */
  off(handler: EventHandler): void {
    const idx = this.handlers.indexOf(handler)
    if (idx !== -1) {
      this.handlers.splice(idx, 1)
    }
  }

  /** Dispatches an event to all registered handlers synchronously. */
  emit(event: GameEvent): void {
    for (const handler of this.handlers) {
      handler(event)
    }
  }
}
