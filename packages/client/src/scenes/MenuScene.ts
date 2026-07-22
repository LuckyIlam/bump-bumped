import Phaser from 'phaser'
import { SFXManager } from '../audio/SFXManager.js'

/** Title screen — waits for any key or gamepad button to start. */
export class MenuScene extends Phaser.Scene {
  private sfx!: SFXManager

  /** Registers the scene under the key 'MenuScene'. */
  constructor() {
    super('MenuScene')
  }

  /** Phaser lifecycle — preloads audio assets. */
  preload(): void {
    this.sfx = new SFXManager(this)
    this.sfx.preload()
  }

  /** Phaser lifecycle — draws the title and listens for input. */
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
