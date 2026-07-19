## Why

Bump & Bumped is a new project — no code exists yet. This change establishes the initial working game with core mechanics, local multiplayer, and a modular architecture ready for future online play.

## What Changes

- Implement the physics engine (`IPhysicsEngine` interface + `MatterPhysicsEngine`) with wall behaviours (bounce, reflect, absorb, amplify)
- Implement vehicle movement (forward + rotation, no reverse) and boost system
- Implement 4 vehicle shapes (circle, diamond, hexagon, square) with random assignment
- Implement the game state (rounds, scoring, elimination, spectator mode)
- Implement the default "Classic" map with 6 pockets and wall/zone system
- Implement map loading and validation from JSON files
- Implement local multiplayer input (2 keyboard + 2 gamepad)
- Implement player select screen, HUD, round/match end screens
- Implement Phaser 4 rendering for arena, vehicles, UI
- Add comprehensive unit tests for the engine and map loader

## Capabilities

### New Capabilities
- `physics-engine`: Core physics simulation with Matter.js, wall behaviours, vehicle control, collision resolution
- `game-state`: Round system, scoring, elimination, spectator mode, boost timers, zone modifiers
- `map-system`: Map file format, loading, validation, and the default "Classic" map
- `multiplayer-input`: Local multiplayer input handling (2 keyboard + 2 gamepad)
- `rendering-client`: Phaser 4 scenes, rendering, screens, HUD, animations

### Modified Capabilities
- (none — no existing specs to modify)

## Impact

- New package `packages/engine/` — shared physics and game state (pure TypeScript, zero DOM)
- New package `packages/client/` — Phaser 4 rendering, input, screens
- Dependency added: Matter.js (wrapped behind `IPhysicsEngine`)
- Dependency added: Phaser 4 (already in package.json)
- Test framework to be decided (Vitest recommended)
