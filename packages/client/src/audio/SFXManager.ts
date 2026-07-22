import type Phaser from 'phaser'

const SOUND_KEYS = ['collision', 'boost', 'elimination', 'countdown', 'go', 'roundEnd', 'matchEnd', 'menuSelect', 'playerReady'] as const

export type SfxKey = (typeof SOUND_KEYS)[number]

/** Sound effects manager — loads and plays short audio clips, queues sounds until audio context is unlocked. */
export class SFXManager {
  private scene: Phaser.Scene
  private loaded = false
  private pending: SfxKey[] = []

  /** @param scene - Phaser scene to access the sound manager. */
  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /** Loads all sound effect assets into the Phaser cache. */
  preload(): void {
    for (const key of SOUND_KEYS) {
      this.scene.load.audio(key, [`audio/${key}.wav`])
    }
  }

  /** Sets up the 'unlocked' listener once to flush queued sounds. */
  private ensureLoaded(): void {
    if (!this.loaded) {
      this.loaded = true
      this.scene.sound.once('unlocked', () => {
        for (const k of this.pending) {
          this.play(k)
        }
        this.pending = []
      })
    }
  }

  /** Plays a sound — queues it if the audio context is still locked. */
  play(key: SfxKey, config?: Phaser.Types.Sound.SoundConfig): void {
    if (this.scene.sound.locked) {
      if (!this.pending.includes(key)) {
        this.pending.push(key)
      }
      this.ensureLoaded()
      return
    }
    this.scene.sound.play(key, { volume: 0.5, ...config })
  }

  /** Plays the collision sound with random pitch variation. */
  playCollision(volume = 0.25): void {
    this.play('collision', { volume, detune: Math.random() * 400 - 200 })
  }

  /** Plays the boost activation sound. */
  playBoost(): void {
    this.play('boost')
  }

  /** Plays the elimination sound. */
  playElimination(): void {
    this.play('elimination')
  }

  /** Plays the countdown tick sound. */
  playCountdown(): void {
    this.play('countdown')
  }

  /** Plays the GO! sound. */
  playGo(): void {
    this.play('go')
  }

  /** Plays the round-end sound. */
  playRoundEnd(): void {
    this.play('roundEnd')
  }

  /** Plays the match-end victory sound. */
  playMatchEnd(): void {
    this.play('matchEnd')
  }

  /** Plays the menu selection sound. */
  playMenuSelect(): void {
    this.play('menuSelect')
  }

  /** Plays the player-ready confirmation sound. */
  playPlayerReady(): void {
    this.play('playerReady')
  }
}
