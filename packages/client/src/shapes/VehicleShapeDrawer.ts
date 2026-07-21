import type Phaser from 'phaser'

export function fillVehicleShape(
  gfx: Phaser.GameObjects.Graphics,
  shape: string,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha: number,
): void {
  gfx.fillStyle(color, alpha)
  switch (shape) {
    case 'square':
      gfx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      break
    case 'diamond':
      gfx.fillPoints(
        [
          { x, y: y - radius },
          { x: x + radius, y },
          { x, y: y + radius },
          { x: x - radius, y },
        ] as Phaser.Math.Vector2[],
        true,
      )
      break
    case 'hexagon': {
      const pts: { x: number; y: number }[] = []
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
        pts.push({ x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius })
      }
      gfx.fillPoints(pts as Phaser.Math.Vector2[], true)
      break
    }
    default:
      gfx.fillCircle(x, y, radius)
  }
}

export function strokeVehicleShape(
  gfx: Phaser.GameObjects.Graphics,
  shape: string,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha: number,
  lineWidth: number,
): void {
  gfx.lineStyle(lineWidth, color, alpha)
  switch (shape) {
    case 'square':
      gfx.strokeRect(x - radius, y - radius, radius * 2, radius * 2)
      break
    case 'diamond':
      gfx.strokePoints(
        [
          { x, y: y - radius },
          { x: x + radius, y },
          { x, y: y + radius },
          { x: x - radius, y },
        ] as Phaser.Math.Vector2[],
        true,
      )
      break
    case 'hexagon': {
      const pts: { x: number; y: number }[] = []
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
        pts.push({ x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius })
      }
      gfx.strokePoints(pts as Phaser.Math.Vector2[], true)
      break
    }
    default:
      gfx.strokeCircle(x, y, radius)
  }
}
