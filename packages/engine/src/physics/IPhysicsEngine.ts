import type {
  BodyId,
  BodyConfig,
  BodyState,
  CollisionEvent,
  WorldConfig,
  WorldState,
} from './types.js'

export type CollisionCallback = (event: CollisionEvent) => void

export interface IPhysicsEngine {
  createWorld(config: WorldConfig): void
  setGravity(gravity: { x: number; y: number }): void

  addBody(config: BodyConfig): BodyId
  removeBody(id: BodyId): void
  getBody(id: BodyId): BodyState | undefined
  setBodyVelocity(id: BodyId, velocity: { x: number; y: number }): void
  setAngularVelocity(id: BodyId, velocity: number): void
  setFrictionAir(id: BodyId, friction: number): void
  applyForce(id: BodyId, force: { x: number; y: number }): void

  step(delta: number): void

  onCollision(callback: CollisionCallback): void
  getBodies(): BodyState[]
  getWorldState(): WorldState
}
