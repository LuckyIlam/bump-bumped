import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseMap } from '../map/parser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VALID_MAP = JSON.stringify({
  formatVersion: 1,
  name: 'Test',
  width: 1200,
  height: 800,
  walls: [
    { x1: 0, y1: 0, x2: 1200, y2: 0, type: 'bounce' },
    { x1: 1200, y1: 0, x2: 1200, y2: 800, type: 'bounce' },
    { x1: 1200, y1: 800, x2: 0, y2: 800, type: 'bounce' },
    { x1: 0, y1: 800, x2: 0, y2: 0, type: 'bounce' },
  ],
  pockets: [{ x: 600, y: 0, radius: 35 }],
  zones: [{ x: 100, y: 100, width: 200, height: 150, type: 'slick' }],
  spawns: [
    { x: 200, y: 400, angle: 0 },
    { x: 1000, y: 400, angle: 180 },
    { x: 600, y: 200, angle: 90 },
    { x: 600, y: 600, angle: -90 },
  ],
})

describe('parseMap', () => {
  it('parses a valid map', () => {
    const result = parseMap(VALID_MAP)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.name).toBe('Test')
    expect(result.value.width).toBe(1200)
    expect(result.value.height).toBe(800)
    expect(result.value.walls).toHaveLength(4)
    expect(result.value.pockets).toHaveLength(1)
    expect(result.value.zones).toHaveLength(1)
    expect(result.value.spawns).toHaveLength(4)
  })

  it('rejects invalid JSON', () => {
    const result = parseMap('not json')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('invalid JSON')
  })

  it('rejects non-object root', () => {
    const result = parseMap('"string"')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('root must be a JSON object')
  })

  it('rejects missing required fields', () => {
    for (const field of ['formatVersion', 'name', 'width', 'height', 'walls', 'pockets', 'spawns']) {
      const json = JSON.parse(VALID_MAP)
      delete json[field]
      const result = parseMap(JSON.stringify(json))
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toContain(`missing required field: ${field}`)
    }
  })

  it('rejects bad wall type', () => {
    const json = JSON.parse(VALID_MAP)
    json.walls[0].type = 'invalid'
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('walls[0].type')
  })

  it('rejects bad zone type', () => {
    const json = JSON.parse(VALID_MAP)
    json.zones[0].type = 'super'
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('zones[0].type')
  })

  it('rejects fewer than 4 walls', () => {
    const json = JSON.parse(VALID_MAP)
    json.walls = [{ x1: 0, y1: 0, x2: 100, y2: 0, type: 'bounce' }]
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('at least 4 walls')
  })

  it('rejects fewer than 1 pocket', () => {
    const json = JSON.parse(VALID_MAP)
    json.pockets = []
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('at least 1 pocket')
  })

  it('rejects wrong spawn count', () => {
    const json = JSON.parse(VALID_MAP)
    json.spawns = [{ x: 200, y: 400, angle: 0 }]
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('exactly 4 spawn')
  })

  it('rejects zero or negative pocket radius', () => {
    const json = JSON.parse(VALID_MAP)
    json.pockets[0].radius = 0
    let result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('radius')

    json.pockets[0].radius = -5
    result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('radius')
  })

  it('rejects negative width/height', () => {
    const json = JSON.parse(VALID_MAP)
    json.width = -100
    let result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)

    json.width = 1200
    json.height = -100
    result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
  })

  it('rejects coordinates outside bounds', () => {
    const json = JSON.parse(VALID_MAP)
    json.walls[0].x2 = 9999
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('out of bounds')
  })

  it('rejects unsupported format version', () => {
    const json = JSON.parse(VALID_MAP)
    json.formatVersion = 99
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('unsupported format version')
  })

  it('zones defaults to empty array when missing', () => {
    const json = JSON.parse(VALID_MAP)
    delete json.zones
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.zones).toEqual([])
  })

  it('ignores unknown fields (forward-compatible)', () => {
    const json = JSON.parse(VALID_MAP)
    json.unknownField = 'should be ignored'
    const result = parseMap(JSON.stringify(json))
    expect(result.ok).toBe(true)
  })

  it('round-trips: parse → stringify → parse produces identical data', () => {
    const result1 = parseMap(VALID_MAP)
    expect(result1.ok).toBe(true)
    if (!result1.ok) return

    const roundtrip = parseMap(JSON.stringify(result1.value))
    expect(roundtrip.ok).toBe(true)
    if (!roundtrip.ok) return
    expect(roundtrip.value).toEqual(result1.value)
  })
})

describe('Classic map file', () => {
  it('parses the embedded Classic map without errors', () => {
    const mapPath = path.resolve(__dirname, '..', 'map', 'classic.json')
    const content = fs.readFileSync(mapPath, 'utf-8')
    const result = parseMap(content)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.name).toBe('Classic')
    expect(result.value.walls).toHaveLength(4)
    expect(result.value.pockets).toHaveLength(6)
    expect(result.value.spawns).toHaveLength(4)
    expect(result.value.zones).toEqual([])
  })
})
