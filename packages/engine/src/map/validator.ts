const VALID_WALL_TYPES = ['bounce', 'reflect', 'absorb', 'amplify']
const VALID_ZONE_TYPES = ['neutral', 'grip', 'slick', 'accelerator']

export function validateFieldTypes(data: Record<string, unknown>): string | null {
  if (typeof data.width !== 'number' || data.width <= 0 || !Number.isInteger(data.width)) return 'width must be a positive integer'
  if (typeof data.height !== 'number' || data.height <= 0 || !Number.isInteger(data.height)) return 'height must be a positive integer'
  if (typeof data.formatVersion !== 'number' || !Number.isInteger(data.formatVersion)) return 'formatVersion must be an integer'
  if (typeof data.name !== 'string') return 'name must be a string'
  if (!Array.isArray(data.walls)) return 'walls must be an array'
  if (!Array.isArray(data.pockets)) return 'pockets must be an array'
  if (data.zones !== undefined && !Array.isArray(data.zones)) return 'zones must be an array'
  if (!Array.isArray(data.spawns)) return 'spawns must be an array'

  return null
}

export function validateRequiredFields(data: Record<string, unknown>): string | null {
  const required = ['formatVersion', 'name', 'width', 'height', 'walls', 'pockets', 'spawns']
  for (const field of required) {
    if (!(field in data)) return `missing required field: ${field}`
  }
  return null
}

export function validateWalls(data: Record<string, unknown>): string | null {
  const walls = data.walls as any[]
  if (walls.length < 4) return 'at least 4 walls required'

  for (let i = 0; i < walls.length; i++) {
    const w = walls[i]
    if (typeof w.x1 !== 'number') return `walls[${i}].x1 must be a number`
    if (typeof w.y1 !== 'number') return `walls[${i}].y1 must be a number`
    if (typeof w.x2 !== 'number') return `walls[${i}].x2 must be a number`
    if (typeof w.y2 !== 'number') return `walls[${i}].y2 must be a number`
    if (typeof w.type !== 'string' || !VALID_WALL_TYPES.includes(w.type)) return `walls[${i}].type must be one of: ${VALID_WALL_TYPES.join(', ')}`
  }
  return null
}

export function validatePockets(data: Record<string, unknown>): string | null {
  const pockets = data.pockets as any[]
  if (pockets.length < 1) return 'at least 1 pocket required'

  for (let i = 0; i < pockets.length; i++) {
    const p = pockets[i]
    if (typeof p.x !== 'number') return `pockets[${i}].x must be a number`
    if (typeof p.y !== 'number') return `pockets[${i}].y must be a number`
    if (typeof p.radius !== 'number' || p.radius <= 0) return `pockets[${i}].radius must be a positive number`
  }
  return null
}

export function validateZones(data: Record<string, unknown>): string | null {
  const zones = (data.zones ?? []) as any[]
  for (let i = 0; i < zones.length; i++) {
    const z = zones[i]
    if (typeof z.x !== 'number') return `zones[${i}].x must be a number`
    if (typeof z.y !== 'number') return `zones[${i}].y must be a number`
    if (typeof z.width !== 'number' || z.width <= 0) return `zones[${i}].width must be a positive number`
    if (typeof z.height !== 'number' || z.height <= 0) return `zones[${i}].height must be a positive number`
    if (typeof z.type !== 'string' || !VALID_ZONE_TYPES.includes(z.type)) return `zones[${i}].type must be one of: ${VALID_ZONE_TYPES.join(', ')}`
  }
  return null
}

export function validateSpawns(data: Record<string, unknown>): string | null {
  const spawns = data.spawns as any[]
  if (spawns.length !== 4) return 'exactly 4 spawn points required'

  for (let i = 0; i < spawns.length; i++) {
    const s = spawns[i]
    if (typeof s.x !== 'number') return `spawns[${i}].x must be a number`
    if (typeof s.y !== 'number') return `spawns[${i}].y must be a number`
    if (typeof s.angle !== 'number') return `spawns[${i}].angle must be a number`
  }
  return null
}

export function validateBounds(data: Record<string, unknown>): string | null {
  const w = data.width as number
  const h = data.height as number
  const walls = data.walls as any[]
  const pockets = data.pockets as any[]
  const zones = (data.zones ?? []) as any[]
  const spawns = data.spawns as any[]

  for (let i = 0; i < walls.length; i++) {
    const wall = walls[i]
    if (wall.x1 < 0 || wall.x1 > w || wall.y1 < 0 || wall.y1 > h) return `walls[${i}] start out of bounds`
    if (wall.x2 < 0 || wall.x2 > w || wall.y2 < 0 || wall.y2 > h) return `walls[${i}] end out of bounds`
  }

  for (let i = 0; i < pockets.length; i++) {
    const p = pockets[i]
    if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) return `pockets[${i}] out of bounds`
  }

  for (let i = 0; i < zones.length; i++) {
    const z = zones[i]
    if (z.x < 0 || z.x + z.width > w || z.y < 0 || z.y + z.height > h) return `zones[${i}] out of bounds`
  }

  for (let i = 0; i < spawns.length; i++) {
    const s = spawns[i]
    if (s.x < 0 || s.x > w || s.y < 0 || s.y > h) return `spawns[${i}] out of bounds`
  }

  return null
}
