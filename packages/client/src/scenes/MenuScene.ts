import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
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
        this.scene.start('PlayerSelectScene')
      })
    }

    const gp = this.input.gamepad
    if (gp) {
      gp.once('down', () => {
        this.scene.start('PlayerSelectScene')
      })
    }
  }
}
