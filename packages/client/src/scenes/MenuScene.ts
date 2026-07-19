import Phaser from 'phaser'

const P1_CONTROLS = 'Joueur 1 : Z (accélérer) / Q (gauche) / D (droite) / SHIFT (boost)'
const P2_CONTROLS = 'Joueur 2 : ↑ (accélérer) / ← (gauche) / → (droite) / SHIFT (boost)'
const GP_CONTROLS = 'Manette %d : R2 (accélérer) / stick gauche (direction) / A (boost)'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2 - 100, 'BUMP & BUMPED', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 40, 'Appuyez sur une touche pour commencer', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 20, P1_CONTROLS, {
        fontSize: '13px',
        color: '#88ccff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 45, P2_CONTROLS, {
        fontSize: '13px',
        color: '#ffcc88',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    const gp = this.input.gamepad
    if (gp) {
      let y = height / 2 + 70
      if (gp.total > 0) {
        for (let i = 0; i < gp.total && i < 2; i++) {
          const pad = gp.getPad(i)
          const label = pad?.connected
            ? GP_CONTROLS.replace('%d', `${i + 1}`)
            : `Manette %d : connectez une manette`.replace('%d', `${i + 1}`)
          this.add
            .text(width / 2, y, label, {
              fontSize: '13px',
              color: '#88ff88',
              fontFamily: 'monospace',
            })
            .setOrigin(0.5)
          y += 25
        }
      }

      gp.on('connected', (_pad: Phaser.Input.Gamepad.Gamepad) => {
        this.scene.restart()
      })
      gp.on('disconnected', () => {
        this.scene.restart()
      })
    }

    const kb = this.input.keyboard
    if (kb) {
      kb.once('keydown', () => {
        this.startGame()
      })
    }

    if (gp) {
      gp.once('down', () => {
        this.startGame()
      })
    }
  }

  private startGame(): void {
    this.scene.start('GameScene')
  }
}
