import type { BodyId } from '../physics/types.js'
import type { GameStateSnapshot, PlayerState } from '../state/GameState.js'

export type GamePhase = 'countdown' | 'playing' | 'roundEnd'

export interface RoundEndInfo {
  winnerPlayer: PlayerState | null | undefined
  sortedPlayers: PlayerState[]
  roundNumber: number
  winnerId: BodyId | null
}

export class GamePhaseManager {
  phase: GamePhase = 'countdown'

  startCountdown(): void {
    this.phase = 'countdown'
  }

  onCountdownComplete(): void {
    this.phase = 'playing'
  }

  onRoundEnded(snapshot: GameStateSnapshot): RoundEndInfo {
    this.phase = 'roundEnd'

    const winnerPlayer = snapshot.round.winner ? snapshot.players.find((p) => p.id === snapshot.round.winner) : null

    const sortedPlayers = [...snapshot.players].sort((a, b) => b.score - a.score)

    return {
      winnerPlayer,
      sortedPlayers,
      roundNumber: snapshot.round.number,
      winnerId: snapshot.round.winner,
    }
  }

  dismissOverlay(isMatchFinished: boolean): 'nextRound' | 'matchEnd' {
    if (isMatchFinished) {
      return 'matchEnd'
    }

    this.phase = 'countdown'
    return 'nextRound'
  }
}
