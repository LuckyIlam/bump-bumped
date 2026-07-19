# Map Format Specification

## 1. Overview

Maps are stored as **JSON files** describing the arena geometry, wall behaviours, floor zones, pockets, and spawn points. The format is designed to be human-writable (for v1) and machine-generated (for a future editor).

File extension: `.json`
Encoding: UTF-8
MIME type: `application/json`

---

## 2. Schema

```json
{
  "formatVersion": 1,
  "name": "string",
  "width": 1200,
  "height": 800,
  "walls": [ WallSegment ],
  "pockets": [ Pocket ],
  "zones": [ Zone ],
  "spawns": [ SpawnPoint ]
}
```

### Top-level fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `formatVersion` | `integer` | yes | Schema version (currently `1`) |
| `name` | `string` | yes | Human-readable map name |
| `width` | `integer` | yes | Arena width in pixels |
| `height` | `integer` | yes | Arena height in pixels |
| `walls` | `WallSegment[]` | yes | List of wall segments forming the arena border (and optional interior walls) |
| `pockets` | `Pocket[]` | yes | List of pocket positions |
| `zones` | `Zone[]` | no | Floor zones (empty array if none) |
| `spawns` | `SpawnPoint[]` | yes | Exact 4 spawn positions |

---

## 3. WallSegment

```json
{
  "x1": 0,
  "y1": 0,
  "x2": 1200,
  "y2": 0,
  "type": "bounce"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x1` | `number` | yes | Start x |
| `y1` | `number` | yes | Start y |
| `x2` | `number` | yes | End x |
| `y2` | `number` | yes | End y |
| `type` | `string` | yes | Wall behaviour type (see below) |

### Wall types

| Value | Behaviour |
|-------|-----------|
| `bounce` | Standard billiard reflection (angle in = angle out, restitution ~0.7) |
| `reflect` | Reverses incoming velocity vector (mirror effect) |
| `absorb` | No bounce, vehicle loses perpendicular velocity (restitution 0) |
| `amplify` | Bounce with speed multiplier ×1.5 |

---

## 4. Pocket

```json
{
  "x": 600,
  "y": 0,
  "radius": 30
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x` | `number` | yes | Centre x |
| `y` | `number` | yes | Centre y |
| `radius` | `number` | yes | Detection radius in pixels |

When a vehicle's centre enters a pocket's radius, it is eliminated.

---

## 5. Zone

```json
{
  "x": 400,
  "y": 200,
  "width": 200,
  "height": 150,
  "type": "slick"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x` | `number` | yes | Top-left x |
| `y` | `number` | yes | Top-left y |
| `width` | `number` | yes | Zone width |
| `height` | `number` | yes | Zone height |
| `type` | `string` | yes | Floor behaviour type (see below) |

### Zone types

| Value | Effect |
|-------|--------|
| `neutral` | Standard driving — no modifier |
| `grip` | Friction ×1.5, max speed ×0.8, turn rate ×1.3 |
| `slick` | Friction ×0.3, max speed ×1.3, turn rate ×0.5 |
| `accelerator` | Max speed ×1.5, turn rate ×0.7 |

---

## 6. SpawnPoint

```json
{
  "x": 200,
  "y": 400,
  "angle": 0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x` | `number` | yes | Spawn x position |
| `y` | `number` | yes | Spawn y position |
| `angle` | `number` | yes | Initial heading angle in degrees (0 = right, 90 = down) |

### Spawn index mapping

| Index | Player |
|-------|--------|
| 0 | Player 1 |
| 1 | Player 2 |
| 2 | Player 3 |
| 3 | Player 4 |

For matches with fewer than 4 players, spawns are used in order (players 1..N).

---

## 7. Example: Default Map "Classic"

```json
{
  "formatVersion": 1,
  "name": "Classic",
  "width": 1200,
  "height": 800,
  "walls": [
    { "x1": 0, "y1": 0, "x2": 1200, "y2": 0, "type": "bounce" },
    { "x1": 1200, "y1": 0, "x2": 1200, "y2": 800, "type": "bounce" },
    { "x1": 1200, "y1": 800, "x2": 0, "y2": 800, "type": "bounce" },
    { "x1": 0, "y1": 800, "x2": 0, "y2": 0, "type": "bounce" }
  ],
  "pockets": [
    { "x": 0, "y": 0, "radius": 35 },
    { "x": 600, "y": 0, "radius": 35 },
    { "x": 1200, "y": 0, "radius": 35 },
    { "x": 0, "y": 800, "radius": 35 },
    { "x": 600, "y": 800, "radius": 35 },
    { "x": 1200, "y": 800, "radius": 35 }
  ],
  "zones": [],
  "spawns": [
    { "x": 200, "y": 400, "angle": 0 },
    { "x": 1000, "y": 400, "angle": 180 },
    { "x": 600, "y": 200, "angle": 90 },
    { "x": 600, "y": 600, "angle": -90 }
  ]
}
```

---

## 8. Validation Rules

1. `width` and `height` must be positive integers.
2. At least 4 `walls` must form a closed loop.
3. `spawns` must contain exactly 4 entries.
4. `pockets` must contain at least 1 entry.
5. Pocket `radius` must be positive.
6. Zone `width` and `height` must be positive.
7. Wall, pocket, and zone coordinates must be within the arena bounds (0,0) to (width, height).
8. `type` fields must be one of the defined values.

---

## 9. Testing

### What must be tested

| Area | What to test |
|------|-------------|
| Parse valid map | Full example map parses without errors and returns correct internal representation |
| Parse invalid JSON | Non-JSON input throws parse error |
| Missing required fields | Each missing required field produces a validation error |
| Invalid wall type | Unknown wall type string is rejected |
| Invalid zone type | Unknown zone type string is rejected |
| Bounds validation | Coordinates outside arena bounds are rejected |
| Spawn count | Fewer or more than 4 spawns is rejected |
| Pocket radius | Zero or negative radius is rejected |
| Round-trip | Load a valid map → save → reload produces identical output |

### Implementation notes

- The map parser/loader must be a **pure function**: `parseMap(json: string): Result<MapData, Error>`
- No file system I/O — the parser receives a string and returns structured data
- File reading is a separate concern (handled by the caller)
- Tests must run without browser or DOM

---

## 10. Future Compatibility

- The `formatVersion` field allows schema evolution.
- Unknown fields in a map file are ignored (forward-compatible).
- A map loader should validate against the current version and reject incompatible versions.
