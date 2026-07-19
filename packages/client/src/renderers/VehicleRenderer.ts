import Phaser from 'phaser'
import type { BodyState } from '@bump-bumped/engine'

const PLAYER_COLORS: number[] = [
  0xff3333,
  0x3388ff,
  0xffcc00,
  0x33ff66,
]

const VEHICLE_RADIUS = 14
const HEADING_LENGTH = 22

export class VehicleRenderer {
  private scene: Phaser.Scene
  private gfx: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
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
    this.gfx.fillCircle(x, y, VEHICLE_RADIUS)

    this.gfx.lineStyle(4, 0xffffff, 0.9)
    const tipX = x + Math.cos(angle) * HEADING_LENGTH
    const tipY = y + Math.sin(angle) * HEADING_LENGTH
    this.gfx.lineBetween(x, y, tipX, tipY)

    this.gfx.lineStyle(3, color, 1)
    this.gfx.strokeCircle(x, y, VEHICLE_RADIUS)
  }
}
