## Context

Bump & Bumped is a new local multiplayer party game built with Phaser 4. The project currently has no code — only dependencies (Phaser 4) and OpenSpec infrastructure. This design covers the initial implementation from scratch.

The game combines bumper cars and billiard mechanics: top-down arena, 6 pockets, vehicles that bump each other into holes. The physics engine must be decoupled from rendering to support future server-authoritative multiplayer.

## Goals / Non-Goals

**Goals:**
- Fully playable local multiplayer game (2-4 players)
- Physics engine with 4 wall types, 4 vehicle shapes, floor zones, boost
- Map system with file-based JSON maps and validation
- Player select screen, HUD, round/match flow
- Comprehensive unit test coverage for engine and map loader
- Monorepo structure with `packages/engine/` and `packages/client/`

**Non-Goals:**
- Online multiplayer — architecture prepared but not wired
- Map editor — maps are hand-authored JSON
- Power-ups — future version
- AI players
- Replay system
- Customisable controls

## Decisions

### 1. Physics engine: raw matter-js behind IPhysicsEngine interface

**Decision**: Use the raw `matter-js` npm package as the physics backend, wrapped behind a custom `IPhysicsEngine` interface.

**Critical distinction**: Matter.js is available TWO ways, and we use BOTH for different purposes:

```
┌─────────────────────────────────────────────────────────────┐
│  packages/engine/  →  raw matter-js npm package             │
│  (pure Node.js)       Matter.Engine, Matter.Bodies, etc.    │
│                       NO Phaser dependency                   │
├─────────────────────────────────────────────────────────────┤
│  packages/client/  →  Phaser's this.matter plugin          │
│  (rendering only)     Used ONLY for rendering shapes,        │
│                       NEVER for physics simulation           │
└─────────────────────────────────────────────────────────────┘
```

The engine package imports `matter-js` directly:
```typescript
import Matter from 'matter-js'
const engine = Matter.Engine.create()
const body = Matter.Bodies.circle(x, y, radius)
```

The client never touches `MatterPhysicsEngine`'s internal engine — it reads `getBodies()` and syncs Phaser visuals.

**Rationale**:
- Matter.js natively supports the shapes we need (circle, rectangle, polygon for diamond/hexagon)
- It runs identically in browser and Node.js (supports server-side use in the future)
- Well-documented collision events, restitution, friction
- The interface allows swapping to a different engine (e.g., Rapier, a custom engine) without changing game code

**Alternatives considered**:
- *Custom physics engine*: Full control but significant implementation effort for polygon collision detection and resolution
- *Rapier*: More performant and deterministic, but WASM dependency adds complexity for initial build
- *Phaser's this.matter plugin for physics*: Couples engine to Phaser, can't run on server
- *Phaser Arcade Physics*: Too limited — no polygon shapes, imprecise restitution

### 2. Monorepo structure with npm workspaces

**Decision**: Use npm workspaces with `packages/engine/` and `packages/client/`.

```
bump-bumped/
├── packages/
│   ├── engine/        pure TS, zero DOM
│   ├── client/        Phaser 4 + rendering + input
├── package.json       workspaces: ["packages/*"]
```

**Rationale**:
- Engine package can be tested independently without Phaser
- Client package depends on engine via workspace reference
- In the future, a `packages/server/` can be added that also depends on `engine`
- No build tool overhead for the simple case

### 3. Map format: JSON with pure function parser

**Decision**: Maps are JSON files parsed by a pure function `parseMap(json: string): Result<MapData, Error>`.

**Rationale**:
- Parser has no file I/O, making it trivially testable
- Result type enforces error handling at the caller level
- JSON is human-writable for v1 and machine-generatable for future editor
- Schema version field enables forward compatibility

### 4. Fixed timestep for determinism

**Decision**: Engine runs at a fixed 60Hz timestep regardless of render frame rate.

**Rationale**:
- Required for deterministic simulation (same inputs = same outputs)
- Enables server-authoritative multiplayer (client predicts, server corrects)
- Matter.js is deterministic with fixed `Runner` timestep
- Rendering interpolates between engine states for smooth visuals

### 5. Input: direct key mapping without config system

**Decision**: Hard-coded AZERTY + Arrow + Gamepad mappings, no rebinding in v1.

**Rationale**:
- Simplifies implementation significantly
- AZERTY is the user's layout; QWERTY support can be added later
- Gamepad mappings follow standard layout (Xbox/PS)
- Customisable controls are explicitly a non-goal for v1

### 6. Boost: timer-based burst

**Decision**: Boost is a timer-based burst (2s active, 5s cooldown) rather than a depleting resource gauge.

**Rationale**:
- Simpler to implement and balance
- Clear binary state machine (ready → active → recharging)
- Parameters easily tweaked in config without redesign
- Gauge system could be explored as a power-up in a future version

### 7. Map validation at parse time

**Decision**: All map validation happens in the parser. The game never receives an invalid map.

**Rationale**:
- Keeps game logic clean — no defensive checks needed
- Error messages are precise (which field failed, why)
- Fail fast at load time rather than mid-game

### 8. Physics → Visual sync (read, don't couple)

**Decision**: The client reads `engine.getBodies()` each frame and syncs Phaser sprite positions/rotations. It NEVER touches the engine's internal Matter.js world for rendering.

**Pattern**:
```
  engine.step(dt)
  const bodies = engine.getBodies()
  for each body → update corresponding Phaser sprite x, y, angle
```

**Rationale**:
- Keeps the engine decoupled (no Phaser dependency)
- Enables server-authoritative sync later (client predicts, server corrects)
- Same pattern works with visual interpolation for smooth 60fps rendering

### 9. Vehicle shape rendering (Phaser Shape objects)

**Decision**: Vehicles are rendered as Phaser 4 Shape objects generated from Graphics at init time.

| Shape | Phaser API | Notes |
|-------|-----------|-------|
| Circle | `this.add.circle(x, y, r, color)` | `this.add.circle` is an alias for `this.add.arc` with 0-360° |
| Square | `this.add.rectangle(x, y, w, h, color)` | Equal width and height |
| Diamond | `this.add.star(x, y, 4, innerR, outerR, color)` | Star with 4 points = diamond |
| Hexagon | `this.add.polygon(x, y, vertices, color)` | 6 vertices computed from radius |

Shapes are generated once via `gfx.generateTexture('vehicle-circle', size, size)` then used as sprites by the physics sync. This avoids per-frame shape drawing.

### 10. Input mapping (Phaser API specifics)

**Decision**: Use Phaser's input APIs directly per the skill reference.

**Keyboard** — per-key polling via `addKey()`:
```
  P1 (AZERTY):  addKey('Z')=throttle, addKey('Q')=turnLeft, addKey('D')=turnRight, addKey(Shift)=boost
  P2 (Arrows):  createCursorKeys() → up=throttle, left=turnLeft, right=turnRight, shiftKey=boost
```

**Gamepad** — polling via `this.input.gamepad.padN`:
```
  throttle:   pad.R2  (0..1 float)
  turn:       pad.leftStick.x  (-1..1)
  boost:      pad.X button
```

### 11. Boost particles (Phaser particle system)

**Decision**: Use Phaser 4 ParticleEmitter for boost visual effects.

- **Trail**: Create emitter with `startFollow(vehicle)`, particles scale from 1→0, alpha 1→0
- **Halo**: Tween a circle shape around the vehicle, pulse when ready
- **Elimination burst**: `emitter.explode(15)` at vehicle position on elimination
- Boost particle texture generated from a small circle via `gfx.generateTexture()`

### 12. Timers (Phaser time events)

**Decision**: Use Phaser's `this.time.addEvent()` for all game timers.

| Timer | Usage |
|-------|-------|
| Countdown | 3 → 2 → 1 → GO! at 1s intervals via `repeat: 3` |
| Round end pause | Single delay before next round |
| Boost cooldown | Tracked in engine state, UI reads state per frame |

## Package Architecture

```
packages/engine/src/
├── physics/
│   ├── IPhysicsEngine.ts      interface
│   ├── MatterPhysicsEngine.ts Matter.js wrapper
│   ├── types.ts               shared types (Vec2, BodyConfig, etc.)
│   └── wall-behaviour.ts      wall type collision handlers
├── state/
│   ├── GameState.ts           round management, scoring, elimination
│   ├── Vehicle.ts             vehicle data + boost state machine
│   ├── Arena.ts               arena construction from map data
│   ├── ZoneSystem.ts          floor zone modifiers
│   └── PocketDetector.ts      pocket entry detection
├── map/
│   ├── parser.ts              pure function map parser
│   ├── validator.ts           map validation rules
│   └── types.ts               map data types
├── input/
│   └── VehicleCommand.ts      input command type
└── index.ts                   public API

packages/client/src/
├── main.ts                    Phaser game config + bootstrap
│   ├── physics.matter.gravity: { x: 0, y: 0 }  (top-down, no gravity)
│   └── scene: [TitleScene, PlayerSelectScene, GameScene, ResultsScene]
├── scenes/
│   ├── TitleScene.ts           "Press any key" → emits signal on input
│   ├── PlayerSelectScene.ts    4 slots, auto-detect keyboard/gamepad
│   ├── GameScene.ts            main loop: engine.step() → sync sprites → check state
│   │                           runs HUDScene in parallel via this.scene.launch()
│   └── ResultsScene.ts         scoreboard, winner, return to title
├── renderers/
│   ├── VehicleRenderer.ts      generates textures per shape via gfx.generateTexture()
│   │                           creates Phaser sprites, syncs from getBodies()
│   │                           boost: particle trail (startFollow) + halo
│   ├── ArenaRenderer.ts        walls (lineBetween or rectangles), pockets (circles)
│   │                           zones (tinted rectangles under floor)
│   └── HUDRenderer.ts          scores, round number, boost charge indicators
│                               (launched as parallel scene for clean separation)
├── input/
│   ├── KeyboardManager.ts      addKey('Z'), addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
│   │                           JustDown() for single-fire events
│   │                           outputs VehicleCommand per player per frame
│   └── GamepadManager.ts       pad.leftStick.x, pad.R2, pad.X
│                               dead zone: Math.abs(value) > 0.15
├── audio/
│   └── SFXManager.ts          load in preload(), this.sound.play('key')
└── textures/
    └── generate.ts             create all procedural textures at boot
                                (vehicle shapes, particle dot, UI elements)
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Matter.js determinism unverified | Write deterministic test early (same input twice → same output). If non-deterministic, isolate and fix or switch to Rapier. |
| Matter.js restitution = `Math.max(a, b)` | `absorb` wall (restitution 0) won't work if vehicle has restitution > 0. Must force zero in collision handler. |
| Matter.js force values are tiny (0.01-0.1) | Tune force values in playtesting. Document that Matter.js forces ≠ pixel values. |
| Dead zones in gamepad input cause drift | Apply dead zone threshold (0.15); test with multiple controller models |
| Boost system unbalanced | Expose all boost parameters in a config file; iterate based on playtesting |
| Polygon collision (diamond, hexagon) feels wrong | Test all 4 shapes early; adjust vertex geometry if needed |
| Map validation too strict for hand-authored JSON | Provide clear error messages with line numbers; test with common mistakes |
| Phaser 4 API instability | Pin exact Phaser version in package.json; refer to its docs |
| Visual sync mismatch (physics vs sprite position) | Sync every frame after engine step. Use simple interpolation if needed. |

## Open Questions

- Test framework: Vitest recommended for engine package (runs on Node.js without DOM). Confirm decision.
- Audio format: WAV or OGG for browser compatibility. Where do audio files live? `packages/client/public/audio/`?
- Diamond vertex geometry: `this.add.star(x, y, 4, innerR, outerR)` — what are inner/outer radius values for a 30px diamond?
- Hexagon vertex coordinates: 6 points at radius R. `this.add.polygon()` — compute at init time or hard-code?
- Boost force multiplier: raw force values need tuning. Start with 0.05 base force, 0.15 boosted, adjust in playtesting.
