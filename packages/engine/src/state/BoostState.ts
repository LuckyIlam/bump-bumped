export type BoostPhase = 'idle' | 'active' | 'recharging'

export interface BoostState {
  phase: BoostPhase
  activeUntil: number
  rechargedAt: number
}

export function createBoostState(): BoostState {
  return { phase: 'idle', activeUntil: 0, rechargedAt: 0 }
}

export function updateBoostPhase(state: BoostState, now: number, wantBoost: boolean, durationMs: number, cooldownMs: number): BoostState {
  let { phase, activeUntil, rechargedAt } = state

  if (phase === 'active' && now >= activeUntil) {
    phase = 'recharging'
    rechargedAt = now + cooldownMs
  }

  if (phase === 'recharging' && now >= rechargedAt) {
    phase = 'idle'
  }

  if (phase === 'idle' && wantBoost) {
    phase = 'active'
    activeUntil = now + durationMs
  }

  return { phase, activeUntil, rechargedAt }
}
