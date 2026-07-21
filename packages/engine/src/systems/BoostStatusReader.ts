import type { BodyId } from '../physics/types.js'
import type { BoostPhase } from '../state/BoostState.js'

export interface BoostStatusReader {
  getBoostState(id: BodyId): BoostPhase | undefined
  getBoostProgress(id: BodyId): number
}
