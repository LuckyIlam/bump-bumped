export type BoostPhase = 'idle' | 'active' | 'recharging'

export interface BoostState {
  phase: BoostPhase
  activeUntil: number
  rechargedAt: number
}

export function createBoostState(): BoostState {
  return { phase: 'idle', activeUntil: 0, rechargedAt: 0 }
}

export function updateBoostPhase(state: BoostState, now: number, wantBoost: boolean, durationMs: number, cooldownMs: number): BoostPhase {
  if (state.phase === 'active' && now >= state.activeUntil) {
    state.phase = 'recharging'
    state.rechargedAt = now + cooldownMs
  }

  if (state.phase === 'recharging' && now >= state.rechargedAt) {
    state.phase = 'idle'
  }

  if (state.phase === 'idle' && wantBoost) {
    state.phase = 'active'
    state.activeUntil = now + durationMs
  }

  return state.phase
}
