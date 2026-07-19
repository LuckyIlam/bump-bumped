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

### 1. Physics engine: Matter.js behind IPhysicsEngine interface

**Decision**: Use Matter.js as the physics backend, wrapped behind a custom `IPhysicsEngine` interface.

**Rationale**:
- Matter.js natively supports the shapes we need (circle, rectangle, polygon for diamond/hexagon)
- It runs identically in browser and Node.js (supports server-side use)
- Well-documented collision events, restitution, friction
- The interface allows swapping to a different engine (e.g., Rapier, a custom engine) without changing game code

**Alternatives considered**:
- *Custom physics engine*: Full control but significant implementation effort for polygon collision detection and resolution
- *Rapier*: More performant and deterministic, but WASM dependency adds complexity for initial build
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
├── scenes/
│   ├── TitleScene.ts
│   ├── PlayerSelectScene.ts
│   ├── GameScene.ts           main gameplay scene
│   └── ResultsScene.ts        round/match end
├── renderers/
│   ├── VehicleRenderer.ts     shape rendering + boost effects
│   ├── ArenaRenderer.ts       walls, pockets, zones
│   └── HUDRenderer.ts         scores, boost indicators
├── input/
│   ├── KeyboardManager.ts     maps key events → VehicleCommands
│   └── GamepadManager.ts      maps gamepad state → VehicleCommands
├── audio/
│   └── SFXManager.ts          sound effect triggers
└── config/
    └── boost-config.ts        boost parameters (duration, cooldown, multiplier)
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Matter.js determinism unverified | Write deterministic test early (same input twice → same output). If non-deterministic, isolate and fix or switch to Rapier. |
| Dead zones in gamepad input cause drift | Apply dead zone threshold; test with multiple controller models |
| Boost system unbalanced | Expose all boost parameters in a config file; iterate based on playtesting |
| Polygon collision (diamond, hexagon) feels wrong | Test all 4 shapes early; adjust vertex geometry if needed |
| Map validation too strict for hand-authored JSON | Provide clear error messages with line numbers; test with common mistakes |
| Phaser 4 API instability | Pin exact Phaser version in package.json; refer to its docs |

## Open Questions

- Test framework: Vitest recommended but not decided — evaluate against Jest for Node.js compatibility
- Asset pipeline: Audio files format (WAV? OGG? MP3?) and where they live in the package structure
- Polygon vertex coordinates for diamond and hexagon: need pixel-precise definition before implementation
