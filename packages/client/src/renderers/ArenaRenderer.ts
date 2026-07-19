import type { MapData } from '@bump-bumped/engine'
import type Phaser from 'phaser'

const WALL_COLORS: Record<string, number> = {
  bounce: 0xaaaaaa,
  reflect: 0x00ffff,
  absorb: 0x666666,
  amplify: 0xff8800,
}

const ZONE_COLORS: Record<string, number> = {
  neutral: 0x333333,
  grip: 0x00ff00,
  slick: 0x00aaff,
  accelerator: 0xff4400,
}

const WALL_LINE_WIDTH = 4

export class ArenaRenderer {
  private scene: Phaser.Scene
  private gfx: Phaser.GameObjects.Graphics
  private map: MapData

  constructor(scene: Phaser.Scene, map: MapData) {
    this.scene = scene
    this.map = map
    this.gfx = scene.add.graphics()
  }

  draw(): void {
    this.gfx.clear()
    this.drawBackground()
    this.drawZones()
    this.drawPockets()
    this.drawWalls()
  }

  private drawBackground(): void {
    const { width, height } = this.map
    this.gfx.fillStyle(0x1a1a2e, 1)
    this.gfx.fillRect(0, 0, width, height)

    this.gfx.lineStyle(1, 0x2a2a4e, 0.5)
    const gridSize = 40
    for (let x = 0; x <= width; x += gridSize) {
      this.gfx.lineBetween(x, 0, x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      this.gfx.lineBetween(0, y, width, y)
    }
  }

  private drawWalls(): void {
    for (const wall of this.map.walls) {
      const color = WALL_COLORS[wall.type] ?? 0xffffff
      this.gfx.lineStyle(WALL_LINE_WIDTH, color, 1)
      this.gfx.lineBetween(wall.x1, wall.y1, wall.x2, wall.y2)
    }
  }

  private drawZones(): void {
    for (const zone of this.map.zones) {
      const color = ZONE_COLORS[zone.type] ?? 0x333333
      this.gfx.fillStyle(color, 0.15)
      this.gfx.fillRect(zone.x, zone.y, zone.width, zone.height)
    }
  }

  private drawPockets(): void {
    for (const pocket of this.map.pockets) {
      this.gfx.fillStyle(0x000000, 0.9)
      this.gfx.fillCircle(pocket.x, pocket.y, pocket.radius)
      this.gfx.lineStyle(2, 0x444444, 0.6)
      this.gfx.strokeCircle(pocket.x, pocket.y, pocket.radius)
    }
  }
}
