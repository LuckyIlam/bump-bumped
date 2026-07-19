import { describe, expect, it } from 'vitest'
import type { GameStateSnapshot } from '../state/GameState.js'
import { GamePhaseManager } from '../systems/GamePhaseManager.js'

function makeSnapshot(overrides?: Partial<GameStateSnapshot>): GameStateSnapshot {
  return {
    match: { currentRound: 1, totalRounds: 3, phase: 'playing', winner: null },
    round: { phase: 'ended', number: 1, aliveCount: 1, eliminationOrder: ['vehicle_1'], winner: 'vehicle_0' },
    players: [
      { id: 'vehicle_0', index: 0, colorIndex: 0, shape: 'circle', alive: false, score: 5, roundScore: 5, eliminationOrder: 0 },
      { id: 'vehicle_1', index: 1, colorIndex: 1, shape: 'square', alive: true, score: 3, roundScore: 3, eliminationOrder: 1 },
    ],
    ...overrides,
  }
}

describe('GamePhaseManager', () => {
  it('starts in countdown phase', () => {
    const mgr = new GamePhaseManager()
    expect(mgr.phase).toBe('countdown')
  })

  it('transitions to playing after countdown', () => {
    const mgr = new GamePhaseManager()
    mgr.onCountdownComplete()
    expect(mgr.phase).toBe('playing')
  })

  it('transitions to roundEnd when round ends and returns info', () => {
    const mgr = new GamePhaseManager()
    const snap = makeSnapshot()
    const info = mgr.onRoundEnded(snap)

    expect(mgr.phase).toBe('roundEnd')
    expect(info.roundNumber).toBe(1)
    expect(info.winnerId).toBe('vehicle_0')
    expect(info.winnerPlayer?.id).toBe('vehicle_0')
  })

  it('dismissOverlay returns matchEnd when match is finished', () => {
    const mgr = new GamePhaseManager()
    const result = mgr.dismissOverlay(true)
    expect(result).toBe('matchEnd')
  })

  it('dismissOverlay returns nextRound when match continues and resets to countdown', () => {
    const mgr = new GamePhaseManager()
    const result = mgr.dismissOverlay(false)

    expect(result).toBe('nextRound')
    expect(mgr.phase).toBe('countdown')
  })

  it('sorts players by score descending in round end info', () => {
    const mgr = new GamePhaseManager()
    const snap = makeSnapshot({
      players: [
        { id: 'vehicle_0', index: 0, colorIndex: 0, shape: 'circle', alive: false, score: 3, roundScore: 3, eliminationOrder: 0 },
        { id: 'vehicle_1', index: 1, colorIndex: 1, shape: 'square', alive: false, score: 5, roundScore: 5, eliminationOrder: 1 },
        { id: 'vehicle_2', index: 2, colorIndex: 2, shape: 'diamond', alive: false, score: 1, roundScore: 1, eliminationOrder: 2 },
      ],
    })

    const info = mgr.onRoundEnded(snap)
    expect(info.sortedPlayers[0].id).toBe('vehicle_1')
    expect(info.sortedPlayers[1].id).toBe('vehicle_0')
    expect(info.sortedPlayers[2].id).toBe('vehicle_2')
  })

  it('identifies the round winner', () => {
    const mgr = new GamePhaseManager()
    const snap = makeSnapshot({ round: { phase: 'ended', number: 2, aliveCount: 1, eliminationOrder: ['vehicle_1'], winner: 'vehicle_0' } })
    const info = mgr.onRoundEnded(snap)

    expect(info.winnerPlayer?.id).toBe('vehicle_0')
    expect(info.roundNumber).toBe(2)
  })

  it('returns null winner when no round winner', () => {
    const mgr = new GamePhaseManager()
    const snap = makeSnapshot({
      round: { phase: 'ended', number: 1, aliveCount: 0, eliminationOrder: ['vehicle_0', 'vehicle_1'], winner: null },
    })
    const info = mgr.onRoundEnded(snap)

    expect(info.winnerPlayer).toBeNull()
    expect(info.winnerId).toBeNull()
  })
})
