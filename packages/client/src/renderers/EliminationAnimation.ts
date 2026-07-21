import { PLAYER_COLORS, VEHICLE_RADIUS } from '@bump-bumped/engine'
import type Phaser from 'phaser'
import { fillVehicleShape } from '../shapes/VehicleShapeDrawer.js'

interface Elimination {
  x: number
  y: number
  angle: number
  shape: string
  color: number
  progress: number
}

export class EliminationAnimation {
  private gfx: Phaser.GameObjects.Graphics
  private anims: Elimination[] = []
  private scorePops: { text: Phaser.GameObjects.Text; vy: number; alpha: number }[] = []

  constructor(private scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(3)
  }

  start(params: { x: number; y: number; shape: string; colorIndex: number }, scoreText?: string): void {
    const color = PLAYER_COLORS[params.colorIndex % PLAYER_COLORS.length]
    this.anims.push({
      x: params.x,
      y: params.y,
      angle: 0,
      shape: params.shape,
      color,
      progress: 0,
    })

    if (scoreText) {
      const t = this.scene.add
        .text(params.x, params.y - 10, scoreText, {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'monospace',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(4)
      this.scorePops.push({ text: t, vy: -0.5, alpha: 1 })
    }
  }

  update(delta: number): void {
    for (const a of this.anims) {
      a.progress += delta / 500
      a.angle += delta * 0.012
    }
    this.anims = this.anims.filter((a) => a.progress < 1)

    for (let i = this.scorePops.length - 1; i >= 0; i--) {
      const pop = this.scorePops[i]
      pop.text.y += pop.vy * (delta / 16)
      pop.alpha -= delta * 0.002
      pop.text.setAlpha(pop.alpha)
      if (pop.alpha <= 0) {
        pop.text.destroy()
        this.scorePops.splice(i, 1)
      }
    }
  }

  draw(): void {
    this.gfx.clear()
    for (const a of this.anims) {
      this.drawElimination(a)
    }
  }

  private drawElimination(a: Elimination): void {
    const scale = 1 - a.progress
    const alpha = 1 - a.progress
    const r = VEHICLE_RADIUS * scale
    if (r < 1) return

    const { x, y } = a

    fillVehicleShape(this.gfx, a.shape, x, y, r, a.color, alpha * 0.8)

    this.gfx.lineStyle(3, a.color, alpha)
    this.gfx.lineBetween(x, y, x + Math.cos(a.angle) * r * 1.4, y + Math.sin(a.angle) * r * 1.4)
  }

  destroy(): void {
    this.gfx.destroy()
  }

  clear(): void {
    this.anims = []
    for (const pop of this.scorePops) {
      pop.text.destroy()
    }
    this.scorePops = []
  }
}
