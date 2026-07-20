# Graph Report - bump-bumped  (2026-07-20)

## Corpus Check
- 85 files · ~57,643 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 989 nodes · 1230 edges · 112 communities (49 shown, 63 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ee471cae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OpenCode OpsX Workflow
- Game Engine Design
- Engine Physics
- CI & Agent Setup
- Map & Physics Plugin
- Input & Timing
- Audio & Game Config
- Scene Management
- Graphics & Shapes
- Zoom & Camera
- Particles
- Tweens & Animation
- OpenSpec Config
- Proposal Workflow
- GamepadManager (proportional analog)
- HUDRenderer
- SFXManager
- Phaser game HTML entry point
- index.ts
- Common Patterns
- Engine — Specification
- Common Patterns
- Game Specification
- Common Patterns
- Common Patterns
- Common Patterns
- Common Patterns
- ADDED Requirements
- GameScene.ts
- ADDED Requirements
- Common Patterns
- biome.json
- ADDED Requirements
- Decisions
- main.ts
- Requirement: Map validation
- tasks.md
- Common Patterns
- ADDED Requirements
- package.json
- package.json
- compilerOptions
- SKILL.md
- package.json
- opsx-explore.md
- compilerOptions
- proposal.md
- tsconfig.json
- opencode.json
- dependencies
- graphify.js
- AGENTS.md
- README.md
- Graphify Agent Configuration
- Project Knowledge Graph
- OPSX Archive Command
- OPSX Explore Command
- OPSX Propose Command
- OPSX Sync Command
- OPSX Update Command
- OpenSpec Apply Change Skill
- OpenSpec Archive Change Skill
- OpenSpec Explore Skill
- OpenSpec Propose Skill
- OpenSpec Sync Specs Skill
- OpenSpec Update Change Skill
- SoundManager
- GameConfig
- Phaser Game Setup and Config Skill
- Phaser Graphics and Shapes Skill
- Phaser Input Skill
- Boost particle effects (trail, halo, burst)
- Decoupled physics from rendering
- Fixed 60Hz timestep for determinism
- Direct key mapping without rebinding
- JSON map format with pure function parser
- Monorepo with npm workspaces
- Physics-visual sync pattern (read don't couple)
- Map parser and validator (pure function)
- KeyboardManager (AZERTY + Arrows)
- Collision event system
- ArenaRenderer
- Phaser scenes (Title, PlayerSelect, Game, Results)
- VehicleRenderer
- Boost state machine (IDLE, ACTIVE, RECHARGING)
- IPhysicsEngine
- MatterPhysicsEngine
- VehicleCommand
- Vehicle shapes (circle, square, diamond, hexagon)
- Wall behaviours (bounce, reflect, absorb, amplify)
- Zone modifiers (neutral, grip, slick, accelerator)
- Elimination and spectator mode
- Match structure (3 rounds, scoring, tiebreaker)
- Screen flow (title, select, countdown, game, results)
- Classic map (1200x800, 6 pockets)
- Map JSON schema
- BoostEffects.ts
- EliminationAnimation
- MatterPhysicsEngine
- ParticleSystem

## God Nodes (most connected - your core abstractions)
1. `BodyId` - 38 edges
2. `MatterPhysicsEngine` - 28 edges
3. `VehicleSystem` - 25 edges
4. `IPhysicsEngine` - 23 edges
5. `SFXManager` - 22 edges
6. `GameState` - 22 edges
7. `Common Patterns` - 18 edges
8. `Common Patterns` - 17 edges
9. `Common Patterns` - 16 edges
10. `BodyState` - 14 edges

## Surprising Connections (you probably didn't know these)
- `VehicleCommand` --references--> `BodyId`  [EXTRACTED]
  packages/engine/src/input/VehicleCommand.ts → packages/engine/src/physics/types.ts
- `MapData` --references--> `ZoneSegment`  [EXTRACTED]
  packages/engine/src/map/types.ts → packages/engine/src/physics/types.ts
- `GameState` --references--> `MapData`  [EXTRACTED]
  packages/engine/src/state/GameState.ts → packages/engine/src/map/types.ts
- `MatterPhysicsEngine` --references--> `CollisionCallback`  [EXTRACTED]
  packages/engine/src/physics/MatterPhysicsEngine.ts → packages/engine/src/physics/IPhysicsEngine.ts
- `PendingEffect` --references--> `WallType`  [EXTRACTED]
  packages/engine/src/physics/MatterPhysicsEngine.ts → packages/engine/src/physics/types.ts

## Import Cycles
- None detected.

## Communities (112 total, 63 thin omitted)

### Community 2 - "Engine Physics"
Cohesion: 0.05
Nodes (13): HUD, HUDPlayer, SHAPE_SYMBOLS, VehicleRenderer, BoostConfig, IPhysicsEngine, MatterPhysicsEngine, BodyId (+5 more)

### Community 3 - "CI & Agent Setup"
Cohesion: 0.50
Nodes (4): Biome Check, CI Pipeline, Client Build, Vitest Runner

### Community 9 - "Graphics & Shapes"
Cohesion: 0.07
Nodes (29): All Shape Types, API Quick Reference — Graphics Methods, Canvas Transforms (Graphics), Common Patterns, Core Concepts — Graphics vs Shape Objects, Drawing Primitives (Graphics), Fill and Stroke Styles (Graphics), Generating Textures from Graphics (+21 more)

### Community 19 - "index.ts"
Cohesion: 0.24
Nodes (4): GamepadManager, KeyboardManager, KeySet, VehicleCommand

### Community 20 - "Common Patterns"
Cohesion: 0.05
Nodes (40): API Quick Reference, Audio and Sound, Audio Format Support, Audio Sprites and Markers, Background Music Pattern, BaseSound (sound instance), BaseSoundManager (`this.sound`), Browser Autoplay Policy (+32 more)

### Community 21 - "Engine — Specification"
Cohesion: 0.05
Nodes (37): 10. Testing, 11. Non-Goals (out of scope for the engine), 1. Purpose, 2. Architecture, 3. Interface: `IPhysicsEngine`, 4. Wall Behaviours, 5. Vehicle Control, 6. Vehicle Shapes & Collision Normals (+29 more)

### Community 22 - "Common Patterns"
Cohesion: 0.05
Nodes (36): API Quick Reference, Clock (this.time), Clock (this.time), Common Patterns, Configuration Reference, Core Concepts, Delayed Call, Events (+28 more)

### Community 23 - "Game Specification"
Cohesion: 0.06
Nodes (36): 10. Visual Style (draft), 11. Audio (preliminary), 12. Testing, 13. Non-Goals (v1), 1. Overview, 2. Players & Controls, 3. Match Structure, 4. Round Flow (+28 more)

### Community 24 - "Common Patterns"
Cohesion: 0.06
Nodes (34): Boot Callbacks, Boot Sequence (src/core/Game.js), Center Modes (src/scale/const/CENTER_CONST.js), Common Patterns, Config Parsing (src/core/Config.js), Configuration Reference, Core Concepts, Custom FPS Limit (+26 more)

### Community 25 - "Common Patterns"
Cohesion: 0.06
Nodes (34): API Quick Reference, Body Configuration Options (`MatterBodyConfig`), Collision Callbacks, Collision Categories and Filtering, Common Patterns, Complex Shapes from Vertices, Composites (Stacks, Chains, Soft Bodies), Compound Bodies (+26 more)

### Community 26 - "Common Patterns"
Cohesion: 0.06
Nodes (33): API Quick Reference, Color Interpolation, Common Patterns, Configuration Reference, Core Concepts, Custom Particle Class, Custom Particle Processor, Death Zones (+25 more)

### Community 27 - "Common Patterns"
Cohesion: 0.06
Nodes (32): API Quick Reference, Basic Tween, Callbacks and Events, Common Patterns, Configuration Reference, Controlling and Killing Tweens, Core Concepts, Easing Functions (+24 more)

### Community 28 - "ADDED Requirements"
Cohesion: 0.06
Nodes (31): ADDED Requirements, Requirement: Boost system, Requirement: Collision events, Requirement: Fixed timestep, Requirement: Matter.js implementation, Requirement: Physics engine interface, Requirement: Random seeding, Requirement: Vehicle control (+23 more)

### Community 29 - "GameScene.ts"
Cohesion: 0.12
Nodes (21): ArenaRenderer, WALL_COLORS, ZONE_COLORS, parseMap(), err(), MapData, ok(), Result (+13 more)

### Community 30 - "ADDED Requirements"
Cohesion: 0.07
Nodes (27): ADDED Requirements, Requirement: Arena rendering, Requirement: Countdown, Requirement: In-game HUD, Requirement: Match end screen, Requirement: Phaser 4 game scenes, Requirement: Round end screen, Requirement: Sound effects (+19 more)

### Community 31 - "Common Patterns"
Cohesion: 0.08
Nodes (25): Adding and Removing Scenes at Runtime, Common Patterns, Configuring Plugins Per Scene, Core Concepts, Cross-Scene Event Communication, Customizing the Injection Map, Events, Game Object Events (+17 more)

### Community 32 - "biome.json"
Cohesion: 0.09
Nodes (22): source, assist, actions, files, includes, formatter, enabled, indentStyle (+14 more)

### Community 33 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Requirement: Boost UI state, Requirement: Elimination, Requirement: Round system, Requirement: Scoring, Requirement: Spawn system, Requirement: Spectator mode, Scenario: Bonus for bank shot (+13 more)

### Community 34 - "Decisions"
Cohesion: 0.11
Nodes (18): 10. Input mapping (Phaser API specifics), 11. Boost particles (Phaser particle system), 12. Timers (Phaser time events), 1. Physics engine: raw matter-js behind IPhysicsEngine interface, 2. Monorepo structure with npm workspaces, 3. Map format: JSON with pure function parser, 4. Fixed timestep for determinism, 5. Input: direct key mapping without config system (+10 more)

### Community 35 - "main.ts"
Cohesion: 0.06
Nodes (13): SfxKey, SFXManager, SOUND_KEYS, config, GameScene, OVERLAY_COLORS, COLORS, MatchEndScene (+5 more)

### Community 36 - "Requirement: Map validation"
Cohesion: 0.12
Nodes (15): ADDED Requirements, Requirement: Default Classic map, Requirement: Map file format, Requirement: Map validation, Requirement: Pure function parser, Scenario: Classic map data, Scenario: Classic map loads on startup, Scenario: Incorrect spawn count rejected (+7 more)

### Community 37 - "tasks.md"
Cohesion: 0.12
Nodes (15): 10. Client — Input, 11. Client — Screens, 12. Client — Rendering, 13. Client — Audio, 14. Determinism Verification, 15. Integration & Playtest, 1. Monorepo & Package Setup, 2. Engine — IPhysicsEngine Interface (+7 more)

### Community 38 - "Common Patterns"
Cohesion: 0.13
Nodes (14): Common Patterns, Core Concepts, Drag and Drop, Gamepad Input, Input Debug, topOnly, and Multi-touch Config, Input: Keyboard, Mouse, Touch, and Gamepad, Interactive Game Objects (setInteractive), Key Combos (+6 more)

### Community 39 - "ADDED Requirements"
Cohesion: 0.14
Nodes (13): ADDED Requirements, Requirement: Analog throttle, Requirement: Gamepad input, Requirement: Input device assignment, Requirement: Keyboard input, Scenario: First keyboard input is P1, Scenario: Gamepad assigned to available slot, Scenario: Gamepad controls (+5 more)

### Community 40 - "package.json"
Cohesion: 0.14
Nodes (13): dependencies, matter-js, devDependencies, @types/matter-js, vitest, main, name, private (+5 more)

### Community 41 - "package.json"
Cohesion: 0.17
Nodes (11): dependencies, phaser, devDependencies, @biomejs/biome, name, private, scripts, ci (+3 more)

### Community 42 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, skipLibCheck (+3 more)

### Community 43 - "SKILL.md"
Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, Handling Different Entry Points, OpenSpec Awareness, The Stance, What You Don't Have To Do, What You Might Do (+2 more)

### Community 44 - "package.json"
Cohesion: 0.18
Nodes (10): devDependencies, typescript, main, name, private, scripts, build, dev (+2 more)

### Community 45 - "opsx-explore.md"
Cohesion: 0.20
Nodes (9): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness, The Stance, What You Don't Have To Do, What You Might Do, When a change exists (+1 more)

### Community 46 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowImportingTsExtensions, noEmit, outDir, resolveJsonModule, rootDir, extends, include

### Community 47 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 48 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 109 - "BoostEffects.ts"
Cohesion: 0.22
Nodes (3): __dirname, OUT, sounds

### Community 110 - "EliminationAnimation"
Cohesion: 0.24
Nodes (3): Elimination, EliminationAnimation, EliminationBody

### Community 115 - "MatterPhysicsEngine"
Cohesion: 0.07
Nodes (38): DEFAULT_BOOST_CONFIG, PLAYER_COLORS, Pocket, CollisionCallback, PendingEffect, SHAPE_VERTICES, BodyConfig, CollisionEvent (+30 more)

### Community 120 - "ParticleSystem"
Cohesion: 0.16
Nodes (4): BoostEffects, Ring, Particle, ParticleSystem

## Knowledge Gaps
- **553 isolated node(s):** `1. Monorepo & Package Setup`, `2. Engine — IPhysicsEngine Interface`, `3. Engine — MatterPhysicsEngine Implementation`, `4. Engine — Wall Behaviours`, `5. Engine — Vehicle Control` (+548 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `Engine Physics` to `MatterPhysicsEngine`, `GameScene.ts`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `BodyId` connect `Engine Physics` to `index.ts`, `MatterPhysicsEngine`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `VehicleSystem` connect `Engine Physics` to `ParticleSystem`, `MatterPhysicsEngine`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `1. Monorepo & Package Setup`, `2. Engine — IPhysicsEngine Interface`, `3. Engine — MatterPhysicsEngine Implementation` to the rest of the system?**
  _562 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Engine Physics` be split into smaller, more focused modules?**
  _Cohesion score 0.05157894736842105 - nodes in this community are weakly interconnected._
- **Should `Graphics & Shapes` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Common Patterns` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._