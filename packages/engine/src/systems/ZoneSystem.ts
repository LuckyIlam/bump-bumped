import type { ZoneModifier, ZoneSegment, ZoneType } from '../physics/types.js'
import { ZONE_MODIFIERS } from '../physics/types.js'

export class ZoneSystem {
  private zones: ZoneSegment[]

  constructor(zones: ZoneSegment[]) {
    this.zones = zones
  }

  getModifierAt(x: number, y: number): ZoneModifier {
    return ZONE_MODIFIERS[this.getTypeAt(x, y)]
  }

  getTypeAt(x: number, y: number): ZoneType {
    for (const z of this.zones) {
      if (x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height) {
        return z.type
      }
    }
    return 'neutral'
  }
}
