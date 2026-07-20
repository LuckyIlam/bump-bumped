import Phaser from 'phaser'
import { SFXManager } from '../audio/SFXManager.js'

export class MenuScene extends Phaser.Scene {
  private sfx!: SFXManager

  constructor() {
    super('MenuScene')
  }

  preload(): void {
    this.sfx = new SFXManager(this)
    this.sfx.preload()
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2 - 60, 'BUMP & BUMPED', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 10, 'Appuyez sur une touche pour commencer', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    const kb = this.input.keyboard
    if (kb) {
      kb.once('keydown', () => {
        this.sfx.playMenuSelect()
        this.scene.start('PlayerSelectScene')
      })
    }

    const gp = this.input.gamepad
    if (gp) {
      gp.once('down', () => {
        this.sfx.playMenuSelect()
        this.scene.start('PlayerSelectScene')
      })
    }
  }
}
