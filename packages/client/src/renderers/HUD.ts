import type { VehicleSystem } from '@bump-bumped/engine'
import type Phaser from 'phaser'

const PLAYER_COLORS: number[] = [0xff3333, 0x3388ff, 0xffcc00, 0x33ff66]
const BOOST_RADIUS = 7
const SLOT_GAP = 200
const HUD_Y = 770
const SLOT_START_X = 100

const SHAPE_SYMBOLS: Record<string, string> = {
  circle: '●',
  square: '■',
  diamond: '◆',
  hexagon: '⬢',
}

interface HUDPlayer {
  id: string
  index: number
  colorIndex: number
  score: number
  shape: string
  alive: boolean
}

export class HUD {
  private gfx: Phaser.GameObjects.Graphics
  private text: Phaser.GameObjects.Text
  private roundText: Phaser.GameObjects.Text
  private playerLabels: Phaser.GameObjects.Text[] = []

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(100).setScrollFactor(0)
    this.text = scene.add
      .text(10, 10, '', {
        fontSize: '14px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(100)

    this.roundText = scene.add
      .text(600, 10, '', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100)

    for (let i = 0; i < 4; i++) {
      const label = scene.add
        .text(SLOT_START_X + i * SLOT_GAP, HUD_Y, '', {
          fontSize: '13px',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(100)
      this.playerLabels.push(label)
    }
  }

  draw(roundNumber: number, totalRounds: number, players: HUDPlayer[], vehicleSystem: VehicleSystem): void {
    this.gfx.clear()
    this.roundText.setText(`Manche ${roundNumber} / ${totalRounds}`)

    for (const p of players) {
      const i = p.index
      const cx = SLOT_START_X + i * SLOT_GAP
      const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]

      this.gfx.fillStyle(color, p.alive ? 0.9 : 0.3)
      this.gfx.fillCircle(cx - 60, HUD_Y, 5)

      const shapeSym = SHAPE_SYMBOLS[p.shape] ?? '?'
      const aliveMark = p.alive ? '' : ' (ÉLIMINÉ)'
      this.playerLabels[i].setText(`P${p.index + 1} ${shapeSym}  ${p.score} pt${p.score > 1 ? 's' : ''}${aliveMark}`)
      this.playerLabels[i].setColor(p.alive ? `#${color.toString(16).padStart(6, '0')}` : '#666666')

      const boostState = vehicleSystem.getBoostState(p.id)
      const progress = vehicleSystem.getBoostProgress(p.id)

      this.drawBoostCharge(cx + 70, HUD_Y, BOOST_RADIUS, boostState, progress)
    }
  }

  private drawBoostCharge(x: number, y: number, radius: number, boostState: string | undefined, progress: number): void {
    this.gfx.fillStyle(0x222222, 0.8)
    this.gfx.fillCircle(x, y, radius + 1)

    if (boostState === 'idle') {
      this.gfx.fillStyle(0x00ff88, 0.9)
      this.gfx.fillCircle(x, y, radius)
    } else if (boostState === 'active') {
      const frac = 1 - progress
      this.gfx.fillStyle(0xff8800, 0.9)
      this.gfx.slice(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac, false)
      this.gfx.fillPath()
    } else if (boostState === 'recharging') {
      this.gfx.fillStyle(0x444444, 0.9)
      this.gfx.fillCircle(x, y, radius)
      this.gfx.fillStyle(0x00aaff, 0.8)
      this.gfx.slice(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false)
      this.gfx.fillPath()
    }
  }

  destroy(): void {
    this.gfx.destroy()
    this.text.destroy()
    this.roundText.destroy()
    for (const l of this.playerLabels) {
      l.destroy()
    }
  }
}
