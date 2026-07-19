# Game Specification

## 1. Overview

Bump & Bumped is a local multiplayer party game mixing **bumper cars** and **billiard** mechanics. Players drive vehicles in a top-down arena, bumping opponents into pockets to score points. The last player standing wins the round.

---

## 2. Players & Controls

### Player count
- **Minimum**: 2
- **Maximum**: 4
- Input mix: 2 keyboard players + 2 gamepad players simultaneously

### Control scheme

| Action | P1 (AZERTY) | P2 (Arrows) | Gamepad |
|--------|-------------|-------------|---------|
| Forward | Z | ↑ | Right trigger / A |
| Turn left | Q | ← | Left stick ← |
| Turn right | D | → | Left stick → |
| Boost | Shift (left) | Shift (right) | X / left shoulder |

- **No reverse.** Vehicles only go forward. Turning while stationary pivots on the spot.
- **Boost** is a limited-duration speed burst with reduced turn control (see [engine.md](./engine.md), §5).

### Peripheral detection
On the player-select screen, each player presses any input to join. The system auto-assigns:
- First keyboard input → P1 (ZQSD)
- Second keyboard input → P2 (Arrows)
- First gamepad input → P3
- Second gamepad input → P4

---

## 3. Match Structure

### Round
- A round begins with all alive players spawned at fixed positions.
- All players are alive.
- The round ends when only one player remains (last man standing).

### Match
- A match consists of **3 rounds**.
- Players accumulate score across rounds.
- The player with the highest total score at the end of the match wins.
- **Tiebreaker**: if scores are tied after 3 rounds, a sudden-death round with a shrinking arena decides the winner.

### Scoring

| Placement | Points |
|-----------|--------|
| 1st (last alive) | 5 |
| 2nd | 3 |
| 3rd | 1 |
| 4th | 0 |

### Bonus points
| Bonus | Condition | Points |
|-------|-----------|--------|
| Bumper | Eliminate a player by bumping them directly | +1 |
| Bank shot | Eliminate a player after 2+ wall bounces | +2 per bounce ≥2 |
| Last second | Eliminate last opponent while being the only one alive | +1 |

---

## 4. Round Flow

```
  ┌─────────────────────────────────────────────┐
  │  1. COUNTDOWN  (3, 2, 1, GO!)               │
  │     ── players are locked, can't move       │
  ├─────────────────────────────────────────────┤
  │  2. PLAY                                     │
  │     ── free movement, bumping, chaos        │
  │     ── when a player enters a pocket:        │
  │         → elimination animation (spin +      │
  │           shrink)                            │
  │         → player becomes spectator           │
  ├─────────────────────────────────────────────┤
  │  3. ROUND END                                │
  │     ── when 1 player remains                 │
  │     ── winner celebration (1-2s)             │
  │     ── scoreboard overlay                    │
  ├─────────────────────────────────────────────┤
  │  4. NEXT ROUND (or match end)                │
  │     ── respawn all players                   │
  │     ── reassign vehicle shapes randomly      │
  └─────────────────────────────────────────────┘
```

### Pocket elimination
- When a vehicle's center enters a pocket radius → elimination.
- Animation: vehicle spins on itself while shrinking (scale → 0, ~0.5s).
- Small sound effect: comedic "pop" or "boing".
- Vehicle body is removed from physics engine.
- Player enters spectator mode for the remainder of the round.

---

## 5. Spawn

### Spawn positions (4-player layout)

```
  ┌─────────────────────────────────────────┐
  │                                         │
  │              P3                         │
  │                                         │
  │  P1                     P2              │
  │                                         │
  │              P4                         │
  │                                         │
  └─────────────────────────────────────────┘
```

- For 2 players: P1 and P2 only.
- For 3 players: P1, P2, P3 only.
- All spawn facing toward the centre of the arena.
- Spawn positions are defined in the map file.

---

## 6. Vehicle

### Properties (shared across all vehicles in v1)

| Property | Value | Configurable |
|----------|-------|--------------|
| Mass | 1 | Yes |
| Restitution | 0.5 | Yes |
| Max speed | 300 px/s | Yes |
| Turn rate | 180°/s | Yes |
| Boost multiplier | ×2.5 | Yes |
| Boost duration | 2s | Yes |
| Boost cooldown | 5s | Yes |

### Shapes

| Shape | Behaviour | Visual |
|-------|-----------|--------|
| Circle | Radial normals, predictable | ○ |
| Diamond | Point-rich, surprising ricochets | ◇ |
| Hexagon | 6 facets, balanced | ⬡ |
| Square | 90° corners, boxy | □ |

- Shape is assigned **randomly** at the start of each round.
- Player colour is assigned at the start of the match (kept across rounds).

### Boost state indicator
A circular halo around each vehicle shows boost status:

| State | Halo | Sound |
|-------|------|-------|
| Ready | Full, pulsing glow | Engine idle rumble |
| Active | Bright, expanding particles | Engine pitch rising |
| Recharging | Empty ring filling up | Low hum |

---

## 7. Arena

### Default map: "Classic"

```
  1200 × 800 px
  6 pockets (corners + midpoints of long sides)

  Walls: all "bounce" type in v1 (other types can be placed manually)
  Floor: all "neutral" in v1 (zones can be placed manually)
```

### Wall types

| Type | Effect |
|------|--------|
| `bounce` | Standard billiard reflection (angle in = angle out) |
| `reflect` | Reverses incoming direction (mirror) |
| `absorb` | No bounce, vehicle loses perpendicular velocity |
| `amplify` | Bounce with speed multiplier ×1.5 |

### Floor zone types

| Type | Effect |
|------|--------|
| `neutral` | Normal driving |
| `grip` | Increased traction, reduced max speed |
| `slick` | Reduced traction, increased max speed |
| `accelerator` | Passive speed boost, reduced turn rate |

---

## 8. Screens & UI Flow

```
  ┌──────────┐     ┌──────────────┐     ┌──────────────┐
  │  TITLE    │────▶│  PLAYER      │────▶│  COUNTDOWN   │
  │  SCREEN   │     │  SELECT      │     │  (3, 2, 1)   │
  └──────────┘     └──────────────┘     └──────┬───────┘
                                                │
  ┌──────────┐     ┌──────────────┐            │
  │  MATCH   │◀────│  ROUND END   │◀───────────┘
  │  END     │     │  SCOREBOARD  │
  └──────────┘     └──────────────┘
```

### Title screen
- Game title: "Bump & Bumped"
- "Press any key / button to start"
- Simple background with looping vehicle animations

### Player select
- 4 slots, empty until a player presses a key/button
- Assigned colour appears on the slot
- Display controls for each player (keyboard icons or gamepad layout)
- "Press START when ≥ 2 players"

### HUD (during round)
- Top bar: round number + player scores
- Per-player: vehicle colour + shape + score
- No minimap (players can see the full arena)

### Round end overlay
- "PLAYER X WINS THE ROUND!"
- Scoreboard with all players and their total scores
- Brief pause (3s) before next round

### Match end screen
- Winner highlight with crown/glow
- Full scoreboard (all rounds)
- "Press any key to return to title"

---

## 9. Spectator Mode

When eliminated, a player:
- Sees the arena from the same top-down view
- Cannot control anything
- May see all remaining players (no fog of war — everyone sees everything)
- Small indicator text: "SPECTATOR"

---

## 10. Visual Style (draft)

- **Palette**: bold, arcade-like colours. Dark background, neon vehicle colours.
- **Vehicles**: simple geometric shapes (coloured fill + stroke).
- **Arena**: bordered by wall band, dark floor with subtle grid or texture.
- **Pockets**: dark circles with subtle rim.
- **Boost**: particle trail behind vehicle, expanding ring.

---

## 11. Audio (preliminary)

| Event | Sound |
|-------|-------|
| Vehicle-vehicle bump | Solid "thud" |
| Vehicle-wall bounce | Lighter "thud" |
| Boost activate | Engine rev-up |
| Elimination | Comedic "pop" / "boing" |
| Round start | Bell / beep countdown |
| Round end | Fanfare jingle |
| Match end | Longer victory jingle |

---

## 12. Testing

### What must be tested

| Area | What to test |
|------|-------------|
| Round system | Correct round transitions, last-man-standing detection, countdown flow |
| Scoring | Points awarded correctly per placement and bonus conditions |
| Elimination | Player removed from round on pocket entry, becomes spectator |
| Spawn | Players spawn at correct positions with correct angles |
| Boost timers | Duration and cooldown timers fire correctly |
| Edge cases | 2/3/4 players, disconnections (future), ties, sudden death |
| Match flow | Full 3-round match, score accumulation, tiebreaker trigger |

### Map loading

| Area | What to test |
|------|-------------|
| Valid map | Correctly parses all fields and constructs valid game state |
| Invalid map | Rejects malformed files with clear errors |
| Missing fields | Defaults or errors handled properly |
| Wall/pocket/zone types | All type values accepted, invalid values rejected |

---

## 13. Non-Goals (v1)

- Online multiplayer — architecture prepared, but not implemented
- Map editor — map files hand-authored
- Power-ups — future version
- Vehicle stats diversity — all vehicles identical except shape
- AI players — human players only
- Replay system
- Customisable controls
