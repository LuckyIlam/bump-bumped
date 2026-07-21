export {
  BODY_FRICTION,
  BODY_MASS,
  BODY_RESTITUTION,
  PLAYER_COLORS,
  VEHICLE_BASE_FRICTION_AIR,
  VEHICLE_BASE_MAX_SPEED,
  VEHICLE_MAX_FORCE,
  VEHICLE_MAX_TURN_SPEED,
  VEHICLE_RADIUS,
} from './config/game-config.js'
export type { EventHandler, GameEvent } from './events/EventBus.js'
export { EventBus } from './events/EventBus.js'
export type { VehicleCommand } from './input/VehicleCommand.js'
export { parseMap } from './map/parser.js'
export type { MapData, Pocket, Result, SpawnPoint } from './map/types.js'
export { err, ok } from './map/types.js'
export type { CollisionCallback, IPhysicsEngine } from './physics/IPhysicsEngine.js'
export { MatterPhysicsEngine } from './physics/MatterPhysicsEngine.js'
export type {
  BodyConfig,
  BodyId,
  BodyState,
  CollisionEvent,
  Vec2,
  VehicleShape,
  WallSegment,
  WallType,
  WorldConfig,
  WorldState,
  ZoneModifier,
  ZoneSegment,
  ZoneType,
} from './physics/types.js'
export { ZONE_MODIFIERS } from './physics/types.js'
export type { BoostPhase, BoostState } from './state/BoostState.js'
export { createBoostState, updateBoostPhase } from './state/BoostState.js'
export type { GameStateSnapshot, MatchPhase, MatchState, PlayerState, RoundPhase, RoundState, ShapeRandomizer } from './state/GameState.js'
export { GameState } from './state/GameState.js'
export { GameEngine } from './systems/GameEngine.js'
export type { GamePhase, RoundEndInfo } from './systems/GamePhaseManager.js'
export { GamePhaseManager } from './systems/GamePhaseManager.js'
export type { VehicleConfig } from './systems/VehicleSystem.js'
export { VehicleSystem } from './systems/VehicleSystem.js'
export { ZoneSystem } from './systems/ZoneSystem.js'
