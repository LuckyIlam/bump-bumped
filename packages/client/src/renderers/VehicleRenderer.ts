import type { BodyState } from '@bump-bumped/engine'
import { PLAYER_COLORS, VEHICLE_RADIUS } from '@bump-bumped/engine'
import type Phaser from 'phaser'
import { fillVehicleShape, strokeVehicleShape } from '../shapes/VehicleShapeDrawer.js'

const HEADING_LENGTH = 44

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

    fillVehicleShape(this.gfx, body.shape, x, y, VEHICLE_RADIUS, color, 0.8)

    this.gfx.lineStyle(4, 0xffffff, 0.9)
    const tipX = x + Math.cos(angle) * HEADING_LENGTH
    const tipY = y + Math.sin(angle) * HEADING_LENGTH
    this.gfx.lineBetween(x, y, tipX, tipY)

    strokeVehicleShape(this.gfx, body.shape, x, y, VEHICLE_RADIUS, color, 1, 3)
  }
}
