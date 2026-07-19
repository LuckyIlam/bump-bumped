import type { WallSegment, ZoneSegment } from '../physics/types.js'

export interface Pocket {
  x: number
  y: number
  radius: number
}

export interface SpawnPoint {
  x: number
  y: number
  angle: number
}

export interface MapData {
  formatVersion: number
  name: string
  width: number
  height: number
  walls: WallSegment[]
  pockets: Pocket[]
  zones: ZoneSegment[]
  spawns: SpawnPoint[]
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
