export interface BoostConfig {
  speedMultiplier: number
  turnRateMultiplier: number
  durationMs: number
  cooldownMs: number
}

export const DEFAULT_BOOST_CONFIG: BoostConfig = {
  speedMultiplier: 2.5,
  turnRateMultiplier: 0.5,
  durationMs: 2000,
  cooldownMs: 5000,
}
