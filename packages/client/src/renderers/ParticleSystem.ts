import type Phaser from 'phaser'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: number
  life: number
  maxLife: number
  size: number
}

export class ParticleSystem {
  private particles: Particle[] = []
  private gfx: Phaser.GameObjects.Graphics

  constructor(gfx: Phaser.GameObjects.Graphics) {
    this.gfx = gfx
  }

  emit(x: number, y: number, color: number, count: number, opts?: { speed?: number; life?: number; size?: number; spread?: number }): void {
    const speed = opts?.speed ?? 30
    const life = opts?.life ?? 400
    const size = opts?.size ?? 2
    const spread = opts?.spread ?? 1

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const s = speed * (0.3 + Math.random() * 0.7) * spread
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        alpha: 0.7,
        color,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random() * 0.5),
      })
    }
  }

  update(delta: number): void {
    const dt = delta / 1000
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life -= delta
      p.alpha = Math.max(0, (p.life / p.maxLife) * 0.7)
    }
    this.particles = this.particles.filter((p) => p.life > 0)
  }

  draw(): void {
    for (const p of this.particles) {
      this.gfx.fillStyle(p.color, p.alpha)
      this.gfx.fillCircle(p.x, p.y, p.size)
    }
  }

  clear(): void {
    this.particles = []
  }
}
