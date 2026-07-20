import type { GameStateSnapshot } from '@bump-bumped/engine'
import Phaser from 'phaser'
import { SFXManager } from '../audio/SFXManager.js'

const COLORS = ['#ff3333', '#3388ff', '#ffcc00', '#33ff66']

export class MatchEndScene extends Phaser.Scene {
  private snapshot!: GameStateSnapshot
  private sfx!: SFXManager

  constructor() {
    super('MatchEndScene')
  }

  init(data: { snapshot: GameStateSnapshot }): void {
    this.snapshot = data.snapshot
  }

  create(): void {
    this.sfx = new SFXManager(this)
    this.sfx.playMatchEnd()
    const { width, height } = this.scale

    this.add
      .text(width / 2, 80, 'MATCH TERMINÉ !', {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    const sorted = [...this.snapshot.players].sort((a, b) => b.score - a.score)
    const winner = sorted[0]

    this.add
      .text(width / 2, 150, `Grand vainqueur : Joueur ${winner.index + 1}`, {
        fontSize: '28px',
        color: COLORS[winner.colorIndex],
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 200, `en ${this.snapshot.match.currentRound} manches`, {
        fontSize: '16px',
        color: '#888888',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    let y = 280
    for (const p of sorted) {
      const prefix = p.id === this.snapshot.match.winner ? '★ ' : '  '
      this.add
        .text(width / 2, y, `${prefix}Joueur ${p.index + 1}  —  ${p.score} pts`, {
          fontSize: '22px',
          color: COLORS[p.colorIndex],
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
      y += 45
    }

    this.add
      .text(width / 2, y + 60, this.snapshot.match.phase === 'tiebreaker' ? '(Égalité — départage joué)' : '', {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height - 60, 'Appuyez sur une touche pour continuer', {
        fontSize: '16px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    const kb = this.input.keyboard
    if (kb) {
      kb.once('keydown', () => {
        this.scene.start('MenuScene')
      })
    }

    const gp = this.input.gamepad
    if (gp) {
      gp.once('down', () => {
        this.scene.start('MenuScene')
      })
    }
  }
}
