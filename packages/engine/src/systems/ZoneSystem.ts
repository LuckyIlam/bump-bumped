import type { ZoneModifier, ZoneSegment, ZoneType } from '../physics/types.js'
import { ZONE_MODIFIERS } from '../physics/types.js'

export class ZoneSystem {
  private zones: ZoneSegment[]

  /** @param zones - Zone segments parsed from the map. */
  constructor(zones: ZoneSegment[]) {
    this.zones = zones
  }

  /** Returns the zone modifier (friction, max speed, turn rate) at the given position. */
  getModifierAt(x: number, y: number): ZoneModifier {
    return ZONE_MODIFIERS[this.getTypeAt(x, y)]
  }

  /** Returns the zone type at the given position, or 'neutral' if outside any zone. */
  getTypeAt(x: number, y: number): ZoneType {
    for (const z of this.zones) {
      if (x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height) {
        return z.type
      }
    }
    return 'neutral'
  }
}
