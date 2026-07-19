export type BodyId = string

export type VehicleShape = 'circle' | 'square' | 'diamond' | 'hexagon'

export type WallType = 'bounce' | 'reflect' | 'absorb' | 'amplify'

export type ZoneType = 'neutral' | 'grip' | 'slick' | 'accelerator'

export interface Vec2 {
  x: number
  y: number
}

export interface ZoneSegment {
  x: number
  y: number
  width: number
  height: number
  type: ZoneType
}

export interface WorldConfig {
  width: number
  height: number
  walls: WallSegment[]
  zones?: ZoneSegment[]
}

export interface WallSegment {
  x1: number
  y1: number
  x2: number
  y2: number
  type: WallType
}

export interface BodyConfig {
  id: BodyId
  type: 'vehicle' | 'wall'
  shape: VehicleShape
  radius?: number
  vertices?: Vec2[]
  x: number
  y: number
  angle: number
  mass: number
  restitution: number
  friction: number
}

export interface BodyState {
  id: BodyId
  x: number
  y: number
  angle: number
  velocityX: number
  velocityY: number
  angularVelocity: number
}

export interface CollisionEvent {
  bodyA: BodyId
  bodyB: BodyId
  contactPoint: Vec2
  normal: Vec2
  relativeVelocity: number
}

export interface WorldState {
  bodies: BodyState[]
  time: number
}

export interface ZoneModifier {
  frictionMultiplier: number
  maxSpeedMultiplier: number
  turnRateMultiplier: number
}

export const ZONE_MODIFIERS: Record<ZoneType, ZoneModifier> = {
  neutral: { frictionMultiplier: 1, maxSpeedMultiplier: 1, turnRateMultiplier: 1 },
  grip: { frictionMultiplier: 1.5, maxSpeedMultiplier: 0.8, turnRateMultiplier: 1.3 },
  slick: { frictionMultiplier: 0.3, maxSpeedMultiplier: 1.3, turnRateMultiplier: 0.5 },
  accelerator: { frictionMultiplier: 1, maxSpeedMultiplier: 1.5, turnRateMultiplier: 0.7 }
}
