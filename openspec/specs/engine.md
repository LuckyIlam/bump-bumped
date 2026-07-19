# Engine — Specification

## 1. Purpose

The engine is the **authoritative simulation core** of Bump & Bumped. It handles physics, collision resolution, and vehicle control independently of rendering or networking.

It must be:
- **Decoupled** — no dependency on Phaser, DOM, or any rendering library
- **Deterministic** — same inputs always produce same outputs (fixed timestep)
- **Portable** — runs identically in browser (client) and Node.js (server)
- **Swappable** — physics backend (Matter.js) can be replaced behind an interface

**Important**: The engine uses the raw `matter-js` npm package directly (`Matter.Engine`, `Matter.Bodies`, etc.), NOT Phaser's `this.matter` plugin. This allows the engine to run on Node.js without Phaser. The Phaser `this.matter` plugin is only used in the client package for rendering visuals that sync with engine state.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    GameState                         │
│  round system, score system, elimination, spawn     │
│  reads/writes engine state, checks pockets          │
├─────────────────────────────────────────────────────┤
│                    IPhysicsEngine                    │
│  addBody() │ step() │ getBodies() │ onCollision()   │
├─────────────────────────────────────────────────────┤
│              MatterPhysicsEngine                     │
│  wraps Matter.js, handles wall behaviours,          │
│  vehicle control, zone modifiers                     │
└─────────────────────────────────────────────────────┘
```

### Layers

| Layer | Responsibility | Lives in |
|-------|---------------|----------|
| `GameState` | Rules: rounds, scores, elimination, pocket detection, spawning | `packages/engine/src/state/` |
| `IPhysicsEngine` | Interface contract for physics | `packages/engine/src/physics/` |
| `MatterPhysicsEngine` | Concrete implementation wrapping Matter.js | `packages/engine/src/physics/` |

---

## 3. Interface: `IPhysicsEngine`

```typescript
interface IPhysicsEngine {
  createWorld(config: WorldConfig): void
  setGravity(gravity: Vec2): void

  addBody(config: BodyConfig): BodyId
  removeBody(id: BodyId): void
  getBody(id: BodyId): BodyState
  setBodyVelocity(id: BodyId, velocity: Vec2): void
  applyForce(id: BodyId, force: Vec2): void

  step(delta: number): void                    // fixed timestep

  onCollision(callback: CollisionCallback): void
  getBodies(): BodyState[]
  getWorldState(): WorldState
}
```

### Supporting types

```typescript
type BodyId = string
type VehicleShape = 'circle' | 'square' | 'diamond' | 'hexagon'

interface Vec2 {
  x: number
  y: number
}

interface WorldConfig {
  width: number
  height: number
  walls: WallSegment[]
}

interface WallSegment {
  x1: number
  y1: number
  x2: number
  y2: number
  type: WallType
}

type WallType = 'bounce' | 'reflect' | 'absorb' | 'amplify'

interface BodyConfig {
  id: BodyId
  type: 'vehicle' | 'wall' | 'dynamic'
  shape: VehicleShape
  radius?: number                 // for circles
  vertices?: Vec2[]              // for polygons
  x: number
  y: number
  angle: number
  mass: number
  restitution: number            // bounciness (shared across vehicles in v1)
  friction: number
}

interface BodyState {
  id: BodyId
  x: number
  y: number
  angle: number
  velocityX: number
  velocityY: number
  angularVelocity: number
}

interface CollisionEvent {
  bodyA: BodyId
  bodyB: BodyId
  contactPoint: Vec2
  normal: Vec2
  relativeVelocity: number
}

interface WorldState {
  bodies: BodyState[]
  time: number
}
```

---

## 4. Wall Behaviours

| Wall type | Effect | Restitution |
|-----------|--------|-------------|
| `bounce` | Normal billiard reflection (angle in = angle out) | `0.7` |
| `reflect` | Reverses incoming direction (mirror effect) | Special — handled in code |
| `absorb` | No bounce, vehicle loses all perpendicular velocity | `0` |
| `amplify` | Bounce with speed multiplier | `1.5` |

**`reflect` implementation**: Not a native Matter.js feature. The `MatterPhysicsEngine` intercepts `collisionStart` events. When the wall type is `reflect`, it applies an impulse that reverses the vehicle's velocity vector instead of the standard reflection.

**`amplify` implementation**: Restitution > 1.0 is not physically accurate. Apply a velocity multiplier on collision: `outgoingVelocity = incomingVelocity × 1.5` along the reflection normal.

### Matter.js gotchas

| Gotcha | Impact | Mitigation |
|--------|--------|------------|
| `Math.max(bodyA.restitution, bodyB.restitution)` | `absorb` wall (restitution 0) won't absorb if vehicle has restitution > 0 | Override velocity in `collisionStart` handler manually for `absorb` walls |
| Force values are tiny (0.01-0.1 range) | Naive force values produce no visible movement | Use small constants (0.01-0.05 for normal, 0.05-0.15 for boost). Document in config. |
| `setBody`/`setRectangle`/etc. resets all properties | Changing shape mid-game would wipe mass, friction, collision filters | Don't change shape at runtime. Assign once at spawn. |
| Positions are center of mass (not top-left) | Position coordinates differ from Phaser convention | Use center-based positioning everywhere. No offset needed since engine and Phaser both use center. |

---

## 5. Vehicle Control

```typescript
interface VehicleCommand {
  vehicleId: BodyId
  throttle: number       // 0..1 (forward only)
  turn: number           // -1..1 (left/right rotation)
  boost: boolean
}
```

### Movement model

- **No reverse**: `throttle` is always ≥ 0. When throttle = 0, friction decelerates naturally.
- **Rotation**: Applied as angular velocity proportional to `turn`. Rate defined in config.
- **Force application**: Forward force in the direction of the vehicle's current heading angle. Force magnitude = `throttle × maxForce × dt`.
- **Force scale**: Matter.js forces use very small values (0.01-0.1 range). `maxForce` should be roughly 0.02-0.05 for normal driving and 0.05-0.15 for boost. These are NOT pixel values — tune in playtesting.

### Boost behaviour

| Property | Effect |
|----------|--------|
| Speed multiplier | ×2.5 (configurable) |
| Turn rate | Reduced to 50% of normal |
| Inertia | Increased (vehicle slides more) |
| Duration | Burst timer (configurable, e.g. 2s) |
| Cooldown | Recharge timer (configurable, e.g. 5s) |
| Visual | Halo/glow around vehicle, engine pitch rise |
| UI | Circular charge indicator around vehicle (3 states: ready / recharging / active) |

### Boost states

```
  IDLE ──[boost pressed]──▶ ACTIVE ──[timer ends]──▶ RECHARGING
                           ▲                         │
                           └──────[cooldown ends]────┘
```

---

## 6. Vehicle Shapes & Collision Normals

| Shape | Collision behavior | Render visual |
|-------|-------------------|---------------|
| `circle` | Radial normal, predictable bounce | ○ |
| `diamond` | Normals at 90° from points, surprising ricochets | ◇ |
| `hexagon` | Normals on 6 facets, balanced feel | ⬡ |
| `square` | Normals at 45° from corners, boxy behaviour | □ |

Shape is assigned **randomly** to players at round start.

---

## 7. World & Arena Construction

The arena is built from map data (see [map-format.md](./map-format.md) when created):

- **Walls**: Static Matter.js bodies (`isStatic: true`) created from `WallSegment` data.
- **Pockets**: Not modelled as Matter bodies. Detected by `GameState` after each `step()` — checks if a vehicle's position is within `radius` of a pocket center.
- **Floor zones**: Managed by `GameState`. After each step, vehicles inside a zone get a modifier applied:

```typescript
type ZoneType = 'neutral' | 'grip' | 'slick' | 'accelerator'

interface ZoneModifier {
  frictionMultiplier: number
  maxSpeedMultiplier: number
  turnRateMultiplier: number
}
```

| Zone | Friction | Max speed | Turn rate |
|------|----------|-----------|-----------|
| `neutral` | 1.0 | 1.0 | 1.0 |
| `grip` | 1.5 | 0.8 | 1.3 |
| `slick` | 0.3 | 1.3 | 0.5 |
| `accelerator` | 1.0 | 1.5 | 0.7 |

---

## 8. Determinism

For server-authoritative multiplayer:

- Use **fixed timestep**: `engine.step(1/60)` always called with the same delta
- No `Math.random()` inside the engine — any randomness is seeded externally
- Matter.js: deterministic when using `Matter.Runner` with fixed delta; verify during integration
- Vehicle control inputs: timestamped and applied strictly in order
- In the Phaser client, the engine runs at fixed timestep independently of the render frame rate. The engine's `step()` is called from the game loop at 60Hz, while the renderer interpolates the visual state for smooth display.

---

## 9. Event System (from Engine → GameState)

```typescript
interface EngineEvents {
  collision: CollisionEvent
  bodyCreated: BodyState
  bodyRemoved: BodyId
}
```

`GameState` subscribes:
- `collision` → detect vehicle-vehicle bumps for scoring/bonus
- `bodyRemoved` → cleanup on elimination
- After each `step()` call → check pockets, update zone modifiers, advance timers

---

## 10. Testing

The engine must have **comprehensive unit test coverage** since it is the authoritative simulation core shared between client and server.

### What must be tested

| Area | What to test |
|------|-------------|
| `IPhysicsEngine` contract | All methods behave as specified |
| `MatterPhysicsEngine` | Each wall type produces correct velocity output (bounce, reflect, absorb, amplify) |
| Vehicle control | Throttle, turn, boost application produce expected forces |
| Boost state machine | IDLE → ACTIVE → RECHARGING transitions, timer accuracy |
| Vehicle shapes | Collision normals differ correctly per shape |
| Determinism | Same sequence of inputs always produces identical world state |
| Pocket detection | Vehicle inside pocket radius triggers elimination |
| Zone modifiers | Each zone type (grip, slick, accelerator, neutral) applies correct multipliers |
| Collision events | Events fire correctly for vehicle-vehicle and vehicle-wall collisions |

### Framework

- Use the project's standard test framework (to be decided, e.g. Vitest).
- Engine tests must run **without a browser or DOM** (pure Node.js).
- Tests must be runnable in CI.

---

## 11. Non-Goals (out of scope for the engine)

- Rendering — handled by the client package
- Input handling — handled by client input systems
- Network synchronization — handled by the server package
- UI/HUD — handled by the client
- Sound — handled by the client
- Map editor — future feature
- Power-ups — future feature
