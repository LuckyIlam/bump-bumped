import type { MapData, Result } from './types.js'
import { ok, err } from './types.js'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateWalls,
  validatePockets,
  validateZones,
  validateSpawns,
  validateBounds,
} from './validator.js'

const SUPPORTED_FORMAT_VERSION = 1

export function parseMap(json: string): Result<MapData, string> {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(json)
  } catch {
    return err('invalid JSON')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return err('root must be a JSON object')
  }

  const missingFieldError = validateRequiredFields(parsed)
  if (missingFieldError) return err(missingFieldError)

  const typeError = validateFieldTypes(parsed)
  if (typeError) return err(typeError)

  if (parsed.formatVersion !== SUPPORTED_FORMAT_VERSION) {
    return err(`unsupported format version: ${parsed.formatVersion}`)
  }

  const wallError = validateWalls(parsed)
  if (wallError) return err(wallError)

  const pocketError = validatePockets(parsed)
  if (pocketError) return err(pocketError)

  const zoneError = validateZones(parsed)
  if (zoneError) return err(zoneError)

  const spawnError = validateSpawns(parsed)
  if (spawnError) return err(spawnError)

  const boundsError = validateBounds(parsed)
  if (boundsError) return err(boundsError)

  const data: MapData = {
    formatVersion: parsed.formatVersion as number,
    name: parsed.name as string,
    width: parsed.width as number,
    height: parsed.height as number,
    walls: parsed.walls as MapData['walls'],
    pockets: parsed.pockets as MapData['pockets'],
    zones: (parsed.zones ?? []) as MapData['zones'],
    spawns: parsed.spawns as MapData['spawns'],
  }

  return ok(data)
}
