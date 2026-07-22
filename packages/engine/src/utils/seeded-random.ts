import type { VehicleShape } from '../physics/types.js'
import type { ShapeRandomizer } from '../state/GameState.js'

const SHAPES: VehicleShape[] = ['circle', 'square', 'diamond', 'hexagon']

/**
 * Creates a seeded shape randomizer using the mulberry32 PRNG.
 * The same seed always produces the same sequence of shapes.
 * @param seed - Integer seed for the PRNG.
 * @returns A ShapeRandomizer that deterministically picks from the four vehicle shapes.
 */
export function createSeededRandomizer(seed: number): ShapeRandomizer {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296
    return SHAPES[Math.floor(r * SHAPES.length)]
  }
}
