export type BoostPhase = 'idle' | 'active' | 'recharging'

export interface BoostState {
  phase: BoostPhase
  activeUntil: number
  rechargedAt: number
}

/** Returns a new boost state initialised to idle with zero timestamps. */
export function createBoostState(): BoostState {
  return { phase: 'idle', activeUntil: 0, rechargedAt: 0 }
}

/**
 * Advances the boost state machine without mutating the input.
 * Transitions: idle → active → recharging → idle.
 * @returns A new BoostState with the updated phase and timestamps.
 */
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
