import type Phaser from 'phaser'

const SOUND_KEYS = ['collision', 'boost', 'elimination', 'countdown', 'go', 'roundEnd', 'matchEnd', 'menuSelect', 'playerReady'] as const

export type SfxKey = (typeof SOUND_KEYS)[number]

export class SFXManager {
  private scene: Phaser.Scene
  private loaded = false
  private pending: SfxKey[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  preload(): void {
    for (const key of SOUND_KEYS) {
      this.scene.load.audio(key, [`audio/${key}.wav`])
    }
  }

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

  playCollision(volume = 0.25): void {
    this.play('collision', { volume, detune: Math.random() * 400 - 200 })
  }

  playBoost(): void {
    this.play('boost')
  }

  playElimination(): void {
    this.play('elimination')
  }

  playCountdown(): void {
    this.play('countdown')
  }

  playGo(): void {
    this.play('go')
  }

  playRoundEnd(): void {
    this.play('roundEnd')
  }

  playMatchEnd(): void {
    this.play('matchEnd')
  }

  playMenuSelect(): void {
    this.play('menuSelect')
  }

  playPlayerReady(): void {
    this.play('playerReady')
  }
}
