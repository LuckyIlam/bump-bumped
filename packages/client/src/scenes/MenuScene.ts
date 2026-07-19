import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2 - 40, 'BUMP & BUMPED', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 30, 'Appuyez sur ESPACE pour commencer', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 70, 'Joueur 1 : Flèches directionnelles + SHIFT pour boost', {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('GameScene')
    })
  }
}
