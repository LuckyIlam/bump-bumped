import type { BodyState, BoostStatusReader } from '@bump-bumped/engine'
import { PLAYER_COLORS, VEHICLE_RADIUS } from '@bump-bumped/engine'
import type Phaser from 'phaser'
import { ParticleSystem } from './ParticleSystem.js'

interface Ring {
  x: number
  y: number
  radius: number
  alpha: number
  color: number
}

export class BoostEffects {
  private gfx: Phaser.GameObjects.Graphics
  private particleGfx: Phaser.GameObjects.Graphics
  private prevBoostState = new Map<string, string>()
  private rings: Ring[] = []
  private particleSystem: ParticleSystem
  private elapsed = 0

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(2)
    this.particleGfx = scene.add.graphics().setDepth(2)
    this.particleSystem = new ParticleSystem(this.particleGfx)
  }

  update(delta: number, bodies: BodyState[], boostStatus: BoostStatusReader): void {
    this.elapsed += delta
    this.particleSystem.update(delta)

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]
      r.radius += delta * 0.15
      r.alpha -= delta * 0.0015
      if (r.alpha <= 0) {
        this.rings.splice(i, 1)
      }
    }

    this.gfx.clear()
    this.particleGfx.clear()

    for (const body of bodies) {
      const boostState = boostStatus.getBoostState(body.id)
      if (!boostState) continue

      const prev = this.prevBoostState.get(body.id) ?? 'idle'
      const color = this.getColor(body.id)

      if (prev !== 'active' && boostState === 'active') {
        this.rings.push({
          x: body.x,
          y: body.y,
          radius: VEHICLE_RADIUS + 4,
          alpha: 0.6,
          color,
        })
      }

      this.prevBoostState.set(body.id, boostState)

      if (boostState === 'idle' && boostStatus.getBoostProgress(body.id) >= 1) {
        const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 0.006)
        this.gfx.fillStyle(color, pulse * 0.12)
        this.gfx.fillCircle(body.x, body.y, VEHICLE_RADIUS * 1.8)
      }

      if (boostState === 'active') {
        this.gfx.fillStyle(color, 0.12)
        this.gfx.fillCircle(body.x, body.y, VEHICLE_RADIUS * 2.5)
        this.gfx.fillStyle(color, 0.06)
        this.gfx.fillCircle(body.x, body.y, VEHICLE_RADIUS * 4)

        this.particleSystem.emit(body.x, body.y, color, 1, {
          speed: 25,
          life: 350,
          size: 2,
          spread: 0.6,
        })
      }
    }

    for (const r of this.rings) {
      this.gfx.lineStyle(3, r.color, r.alpha)
      this.gfx.strokeCircle(r.x, r.y, r.radius)
    }

    this.particleSystem.draw()
  }

  destroy(): void {
    this.gfx.destroy()
    this.particleGfx.destroy()
  }

  private getColor(bodyId: string): number {
    const idx = parseInt(bodyId.replace('vehicle_', ''), 10)
    return PLAYER_COLORS[idx % PLAYER_COLORS.length]
  }
}
