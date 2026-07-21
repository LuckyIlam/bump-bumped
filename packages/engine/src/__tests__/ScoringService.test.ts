import { describe, expect, it } from 'vitest'
import type { CollisionTracker } from '../state/CollisionTracker.js'
import type { PlayerState } from '../state/GameState.js'
import { ScoringService } from '../state/ScoringService.js'

function player(id: string, index: number, alive: boolean, eliminationOrder = 0): PlayerState {
  return { id, index, colorIndex: index, shape: 'circle', alive, score: 0, roundScore: 0, eliminationOrder }
}

function mockTracker(hitters: Record<string, string | null>, bounces: Record<string, number>): CollisionTracker {
  return {
    getLastHitter: (id: string) => hitters[id] ?? null,
    getBounceCount: (id: string) => bounces[id] ?? 0,
  } as CollisionTracker
}

describe('ScoringService', () => {
  describe('placement points', () => {
    it('should award 5 points to the winner and 3 to the loser in a 2-player round', () => {
      const svc = new ScoringService()
      const players = [player('p1', 0, false, 2), player('p2', 1, true)]
      svc.awardRoundScores(players, ['p1'], mockTracker({}, {}))

      expect(players[0].roundScore).toBe(3)
      expect(players[1].roundScore).toBe(5)
    })

    it('should award 5/3/1/0 in a 4-player round', () => {
      const svc = new ScoringService()
      const players = [player('p4', 3, false, 1), player('p3', 2, false, 2), player('p2', 1, false, 3), player('p1', 0, true)]
      svc.awardRoundScores(players, ['p2', 'p3', 'p4'], mockTracker({}, {}))

      expect(players.find((p) => p.id === 'p1')!.roundScore).toBe(5)
      expect(players.find((p) => p.id === 'p2')!.roundScore).toBe(3)
      expect(players.find((p) => p.id === 'p3')!.roundScore).toBe(1)
      expect(players.find((p) => p.id === 'p4')!.roundScore).toBe(0)
    })

    it('should accumulate scores across rounds', () => {
      const svc = new ScoringService()
      const players = [player('p1', 0, false, 2), player('p2', 1, true)]
      svc.awardRoundScores(players, ['p1'], mockTracker({}, {}))
      expect(players[0].score).toBe(3)
      expect(players[1].score).toBe(5)
    })
  })

  describe('bumper bonus', () => {
    it('should award +1 point for a direct hit elimination', () => {
      const svc = new ScoringService()
      const tracker = mockTracker({ p1: 'p2' }, {})
      const players = [player('p1', 0, false, 1), player('p2', 1, true)]
      svc.awardRoundScores(players, ['p1'], tracker)

      const hitter = players.find((p) => p.id === 'p2')!
      expect(hitter.roundScore).toBe(6)
    })

    it('should award +bounces*2 for wall bounces before elimination', () => {
      const svc = new ScoringService()
      const tracker = mockTracker({ p1: 'p2' }, { p1: 3 })
      const players = [player('p1', 0, false, 1), player('p2', 1, true)]
      svc.awardRoundScores(players, ['p1'], tracker)

      const hitter = players.find((p) => p.id === 'p2')!
      expect(hitter.roundScore).toBe(5 + 1 + 6)
    })

    it('should award only placement points when no hitter', () => {
      const svc = new ScoringService()
      const tracker = mockTracker({}, {})
      const players = [player('p1', 0, false, 1), player('p2', 1, true)]
      svc.awardRoundScores(players, ['p1'], tracker)

      const winner = players.find((p) => p.id === 'p2')!
      expect(winner.roundScore).toBe(5)
    })
  })
})
