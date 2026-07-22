import type { BodyId } from '../physics/types.js'
import type { CollisionTracker } from './CollisionTracker.js'
import type { PlayerState } from './GameState.js'

const PLACEMENT_POINTS = [5, 3, 1, 0]

export class ScoringService {
  /**
   * Awards placement points and bumper bonuses for a finished round.
   * @param players - All players (mutated in place with roundScore and total score).
   * @param eliminationOrder - Order in which players were eliminated (last = first eliminated).
   * @param tracker - Collision tracker providing last-hitter and bounce data.
   */
  awardRoundScores(players: PlayerState[], eliminationOrder: BodyId[], tracker: CollisionTracker): void {
    this.awardPlacementPoints(players)
    this.awardBumperBonuses(players, eliminationOrder, tracker)
  }

  private awardPlacementPoints(players: PlayerState[]): void {
    const sorted: PlayerState[] = []
    const winner = players.find((p) => p.alive)
    if (winner) {
      sorted.push(winner)
    }
    const eliminated = [...players].filter((p) => !p.alive).sort((a, b) => b.eliminationOrder - a.eliminationOrder)
    sorted.push(...eliminated)

    for (let i = 0; i < sorted.length; i++) {
      const points = PLACEMENT_POINTS[i] ?? 0
      sorted[i].roundScore = points
      sorted[i].score += points
    }
  }

  private awardBumperBonuses(players: PlayerState[], eliminationOrder: BodyId[], tracker: CollisionTracker): void {
    for (const eliminatedId of eliminationOrder) {
      const lastHitter = tracker.getLastHitter(eliminatedId)
      if (!lastHitter) continue

      const hitter = players.find((p) => p.id === lastHitter)
      if (!hitter) continue

      hitter.roundScore += 1
      const bounces = tracker.getBounceCount(eliminatedId)
      if (bounces >= 2) {
        hitter.roundScore += bounces * 2
      }
    }
  }
}
