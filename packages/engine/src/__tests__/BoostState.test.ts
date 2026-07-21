import { describe, expect, it } from 'vitest'
import type { BoostState } from '../state/BoostState.js'
import { createBoostState, updateBoostPhase } from '../state/BoostState.js'

describe('createBoostState', () => {
  it('should return idle state with zero timestamps', () => {
    const state = createBoostState()
    expect(state.phase).toBe('idle')
    expect(state.activeUntil).toBe(0)
    expect(state.rechargedAt).toBe(0)
  })
})

describe('updateBoostPhase', () => {
  const DURATION = 2000
  const COOLDOWN = 3000

  it('should activate when boost is requested from idle', () => {
    const state = createBoostState()
    const result = updateBoostPhase(state, 1000, true, DURATION, COOLDOWN)
    expect(result.phase).toBe('active')
    expect(result.activeUntil).toBe(3000)
    expect(result.rechargedAt).toBe(0)
  })

  it('should stay idle when boost is not requested', () => {
    const state = createBoostState()
    const result = updateBoostPhase(state, 1000, false, DURATION, COOLDOWN)
    expect(result.phase).toBe('idle')
  })

  it('should go to recharging after duration expires', () => {
    const state: BoostState = { phase: 'active', activeUntil: 2000, rechargedAt: 0 }
    const result = updateBoostPhase(state, 3000, true, DURATION, COOLDOWN)
    expect(result.phase).toBe('recharging')
    expect(result.rechargedAt).toBe(6000)
  })

  it('should stay active while within duration', () => {
    const state: BoostState = { phase: 'active', activeUntil: 5000, rechargedAt: 0 }
    const result = updateBoostPhase(state, 3000, true, DURATION, COOLDOWN)
    expect(result.phase).toBe('active')
  })

  it('should go to idle after cooldown expires', () => {
    const state: BoostState = { phase: 'recharging', activeUntil: 0, rechargedAt: 3000 }
    const result = updateBoostPhase(state, 4000, false, DURATION, COOLDOWN)
    expect(result.phase).toBe('idle')
  })

  it('should stay recharging while within cooldown', () => {
    const state: BoostState = { phase: 'recharging', activeUntil: 0, rechargedAt: 5000 }
    const result = updateBoostPhase(state, 3000, false, DURATION, COOLDOWN)
    expect(result.phase).toBe('recharging')
  })

  it('should not mutate the input state', () => {
    const original: BoostState = { phase: 'idle', activeUntil: 0, rechargedAt: 0 }
    const frozen = { ...original }
    updateBoostPhase(original, 1000, true, DURATION, COOLDOWN)
    expect(original).toEqual(frozen)
  })

  it('should return a new object reference', () => {
    const state = createBoostState()
    const result = updateBoostPhase(state, 1000, true, DURATION, COOLDOWN)
    expect(result).not.toBe(state)
  })

  it('should activate immediately when idle and boost requested during recharging', () => {
    const state: BoostState = { phase: 'recharging', activeUntil: 0, rechargedAt: 5000 }
    const result = updateBoostPhase(state, 6000, true, DURATION, COOLDOWN)
    expect(result.phase).toBe('active')
    expect(result.activeUntil).toBe(8000)
  })

  it('should not activate from recharging before cooldown even with boost', () => {
    const state: BoostState = { phase: 'recharging', activeUntil: 0, rechargedAt: 5000 }
    const result = updateBoostPhase(state, 3000, true, DURATION, COOLDOWN)
    expect(result.phase).toBe('recharging')
  })
})
