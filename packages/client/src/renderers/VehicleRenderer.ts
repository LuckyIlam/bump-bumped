import type { BodyState } from '@bump-bumped/engine'
import type Phaser from 'phaser'

const PLAYER_COLORS: number[] = [0xff3333, 0x3388ff, 0xffcc00, 0x33ff66]

const VEHICLE_RADIUS = 14
const HEADING_LENGTH = 22

export class VehicleRenderer {
  private gfx: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics()
  }

  draw(bodies: BodyState[]): void {
    this.gfx.clear()

    for (const body of bodies) {
      const color = PLAYER_COLORS[parseInt(body.id.replace('vehicle_', ''), 10) % PLAYER_COLORS.length]
      this.drawVehicle(body, color)
    }
  }

  private drawVehicle(body: BodyState, color: number): void {
    const { x, y, angle } = body

    this.gfx.fillStyle(color, 0.8)

    switch (body.shape) {
      case 'square':
        this.gfx.fillRect(x - VEHICLE_RADIUS, y - VEHICLE_RADIUS, VEHICLE_RADIUS * 2, VEHICLE_RADIUS * 2)
        break
      case 'diamond':
        this.gfx.fillPoints(
          [
            { x, y: y - VEHICLE_RADIUS },
            { x: x + VEHICLE_RADIUS, y },
            { x, y: y + VEHICLE_RADIUS },
            { x: x - VEHICLE_RADIUS, y },
          ] as Phaser.Math.Vector2[],
          true,
        )
        break
      case 'hexagon': {
        const pts: { x: number; y: number }[] = []
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
          pts.push({ x: x + Math.cos(a) * VEHICLE_RADIUS, y: y + Math.sin(a) * VEHICLE_RADIUS })
        }
        this.gfx.fillPoints(pts as Phaser.Math.Vector2[], true)
        break
      }
      default:
        this.gfx.fillCircle(x, y, VEHICLE_RADIUS)
    }

    this.gfx.lineStyle(4, 0xffffff, 0.9)
    const tipX = x + Math.cos(angle) * HEADING_LENGTH
    const tipY = y + Math.sin(angle) * HEADING_LENGTH
    this.gfx.lineBetween(x, y, tipX, tipY)

    this.gfx.lineStyle(3, color, 1)
    switch (body.shape) {
      case 'square':
        this.gfx.strokeRect(x - VEHICLE_RADIUS, y - VEHICLE_RADIUS, VEHICLE_RADIUS * 2, VEHICLE_RADIUS * 2)
        break
      case 'diamond':
        this.gfx.strokePoints(
          [
            { x, y: y - VEHICLE_RADIUS },
            { x: x + VEHICLE_RADIUS, y },
            { x, y: y + VEHICLE_RADIUS },
            { x: x - VEHICLE_RADIUS, y },
          ] as Phaser.Math.Vector2[],
          true,
        )
        break
      case 'hexagon': {
        const pts: { x: number; y: number }[] = []
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
          pts.push({ x: x + Math.cos(a) * VEHICLE_RADIUS, y: y + Math.sin(a) * VEHICLE_RADIUS })
        }
        this.gfx.strokePoints(pts as Phaser.Math.Vector2[], true)
        break
      }
      default:
        this.gfx.strokeCircle(x, y, VEHICLE_RADIUS)
    }
  }
}
