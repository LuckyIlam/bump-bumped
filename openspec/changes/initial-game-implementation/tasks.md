## 1. Monorepo & Package Setup

- [x] 1.1 Initialize root package.json with npm workspaces (`packages/engine`, `packages/client`)
- [x] 1.2 Scaffold `packages/engine/` with TypeScript config, package.json, src/ structure
- [x] 1.3 Scaffold `packages/client/` with TypeScript config, package.json, src/ structure
- [x] 1.4 Add dependencies: `matter-js` and `@types/matter-js` to engine package
- [x] 1.5 Verify Phaser 4 import works in client package
- [x] 1.6 Set up Vitest in engine package with a passing test

## 2. Engine — IPhysicsEngine Interface

- [x] 2.1 Define shared types: `Vec2`, `BodyId`, `BodyConfig`, `BodyState`, `WorldConfig`, `WallSegment`, `CollisionEvent`, `WorldState`
- [x] 2.2 Define `VehicleShape` type and `WallType` type
- [x] 2.3 Define `IPhysicsEngine` interface with all methods
- [x] 2.4 Define `VehicleCommand` interface
- [x] 2.5 Write unit tests verifying the interface contract

## 3. Engine — MatterPhysicsEngine Implementation

- [x] 3.1 Implement `createWorld` — create Matter.js Engine + World from WorldConfig
- [x] 3.2 Implement `addBody` — create Matter.js bodies for all 4 shapes (circle, rectangle, polygon)
- [x] 3.3 Implement `removeBody`, `getBody`, `setBodyVelocity`, `applyForce`
- [x] 3.4 Implement `step` — advance Matter.js engine with fixed delta
- [x] 3.5 Implement `onCollision` — wrap Matter.js collision events
- [x] 3.6 Implement `getBodies` and `getWorldState` — snapshot current state
- [x] 3.7 Write unit tests: body creation, removal, state queries, step advancement

## 4. Engine — Wall Behaviours

- [x] 4.1 Implement `bounce` wall — default Matter.js reflection with restitution 0.7
- [x] 4.2 Implement `reflect` wall — intercept collision, reverse velocity vector
- [x] 4.3 Implement `absorb` wall — zero perpendicular velocity component on collision
- [x] 4.4 Implement `amplify` wall — multiply outgoing velocity by 1.5
- [x] 4.5 Write unit tests for each wall type: direction-in → direction-out assertions

## 5. Engine — Vehicle Control

- [x] 5.1 Implement throttle: apply forward force in vehicle heading direction
- [x] 5.2 Implement turn: apply angular velocity proportional to turn input
- [x] 5.3 Implement no-reverse: throttle clamped to ≥ 0, friction decelerates
- [x] 5.4 Implement boost state machine (IDLE → ACTIVE → RECHARGING) with timers
- [x] 5.5 Implement boost effects: speed ×2.5, turn rate ×0.5, increased inertia
- [x] 5.6 Expose boost state for UI query
- [x] 5.7 Write unit tests: movement, rotation, boost transitions, timer accuracy

## 6. Engine — Zone System

- [x] 6.1 Implement zone modifier look-up by position (after each step)
- [x] 6.2 Implement `neutral` zone (no modifier)
- [x] 6.3 Implement `grip` zone (friction ×1.5, max speed ×0.8, turn ×1.3)
- [x] 6.4 Implement `slick` zone (friction ×0.3, max speed ×1.3, turn ×0.5)
- [x] 6.5 Implement `accelerator` zone (max speed ×1.5, turn ×0.7)
- [x] 6.6 Write unit tests: each zone type produces correct modifiers

## 7. Engine — Map System

- [x] 7.1 Implement pure function `parseMap(json: string): Result<MapData, Error>`
- [x] 7.2 Implement map validation: required fields, type checks, bounds, spawn count
- [x] 7.3 Create default "Classic" map JSON file
- [x] 7.4 Write unit tests: valid parse, invalid JSON, missing fields, bad types, bounds, spawn count, round-trip

## 8. Engine — GameState

- [x] 8.1 Implement round system: start, last-man-standing detection, end
- [x] 8.2 Implement scoring: placement points (5/3/1/0), bonus points (bumper, bank shot)
- [x] 8.3 Implement 3-round match with score accumulation
- [x] 8.4 Implement tiebreaker: sudden-death with shrinking arena
- [x] 8.5 Implement pocket detection: check vehicle position vs pocket radius after each step
- [x] 8.6 Implement elimination: remove body from physics, set player to spectator
- [x] 8.7 Implement spawn: place players at map-defined positions with random shape
- [x] 8.8 Write unit tests: round flow, scoring, elimination, spawn, 2/3/4 player cases

## 9. Client — Project Bootstrap

- [x] 9.1 Create Phaser 4 game config (top-down view, 1200×800 canvas)
- [x] 9.2 Create scene manager with scene transitions
- [x] 9.3 Configure camera (fixed top-down, no scrolling)

## 10. Client — Input

- [x] 10.1 Implement `KeyboardManager`: detect AZERTY vs QWERTY layout, map ZQSD/Arrows to commands
- [x] 10.2 Implement `GamepadManager`: detect gamepads, map triggers/sticks/buttons to commands
- [x] 10.3 Implement input device assignment on player select screen
- [x] 10.4 Write input-to-command pipeline: raw input → `VehicleCommand` per player per frame

## 11. Client — Screens

- [x] 11.1 Implement TitleScene: game title, "Press any key/button"
- [x] 11.2 Implement PlayerSelectScene: 4 slots, colour assignment, device detection, START button
- [x] 11.3 Implement countdown overlay (3-2-1-GO!)
- [x] 11.4 Implement GameScene: main gameplay loop, engine step → render cycle
- [x] 11.5 Implement RoundEnd overlay: winner display, scoreboard, 3s pause
- [x] 11.6 Implement MatchEnd scene: winner highlight, full scoreboard, return to title

## 12. Client — Rendering

- [x] 12.1 Implement `ArenaRenderer`: draw walls (coloured bands), pockets (dark circles), zones (tinted floor)
- [x] 12.2 Implement `VehicleRenderer`: draw shapes with player colours, apply rotation
- [x] 12.3 Implement boost visual effects: glow halo, particle trail, expanding ring
- [x] 12.4 Implement boost UI: circular charge indicator (ready/recharging/active)
- [x] 12.5 Implement elimination animation: spin + shrink to 0 over 0.5s
- [x] 12.6 Implement HUD: round number, player scores, shapes

## 13. Client — Audio

- [ ] 13.1 Implement `SFXManager`: load and play sound effects
- [ ] 13.2 Wire sounds to events: collisions, boost, elimination, countdown, round/match end

## 14. Determinism Verification

- [ ] 14.1 Write integration test: same inputs x 2 runs → identical world state
- [ ] 14.2 Verify seeded randomness produces consistent shape assignment
- [ ] 14.3 Verify Matter.js determinism with fixed timestep in Node.js

## 15. Integration & Playtest

- [ ] 15.1 Wire engine + game state + client in GameScene (engine step → render frame)
- [ ] 15.2 Test 2-player split keyboard end-to-end: select → countdown → play → elimination → round end → match end
- [ ] 15.3 Test 4-player (2 keyboard + 2 simulated gamepad)
- [ ] 15.4 Test default Classic map loads correctly in-game
- [ ] 15.5 Test boost visual feedback and timer behaviour in-game
- [ ] 15.6 Test tiebreaker scenario
- [ ] 15.7 Playtest and tune boost parameters, wall restitution, zone multipliers
