import type { MapData, VehicleCommand, VehicleShape } from '@bump-bumped/engine'
import { MatterPhysicsEngine, parseMap, VehicleSystem, ZoneSystem } from '@bump-bumped/engine'
import Phaser from 'phaser'
import classicMapData from '../map-data.json'
import { ArenaRenderer } from '../renderers/ArenaRenderer.js'
import { VehicleRenderer } from '../renderers/VehicleRenderer.js'

const STEP_MS = 1000 / 60

const VEHICLE_SHAPES: VehicleShape[] = ['circle', 'square', 'diamond', 'hexagon']

export class GameScene extends Phaser.Scene {
  private engine!: MatterPhysicsEngine
  private vehicleSystem!: VehicleSystem
  private zoneSystem!: ZoneSystem
  private arenaRenderer!: ArenaRenderer
  private vehicleRenderer!: VehicleRenderer
  private map!: MapData
  private accumulator = 0
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super('GameScene')
  }

  create(): void {
    const result = parseMap(JSON.stringify(classicMapData))
    if (!result.ok) {
      throw new Error(`Failed to parse map: ${result.error}`)
    }
    this.map = result.value

    this.engine = new MatterPhysicsEngine()
    this.engine.createWorld({
      width: this.map.width,
      height: this.map.height,
      walls: this.map.walls,
      zones: this.map.zones,
    })

    this.vehicleSystem = new VehicleSystem(this.engine)
    this.zoneSystem = new ZoneSystem(this.map.zones)

    for (let i = 0; i < this.map.spawns.length; i++) {
      const spawn = this.map.spawns[i]
      const id = `vehicle_${i}`
      this.engine.addBody({
        id,
        type: 'vehicle',
        shape: VEHICLE_SHAPES[i % VEHICLE_SHAPES.length],
        radius: 14,
        x: spawn.x,
        y: spawn.y,
        angle: (spawn.angle * Math.PI) / 180,
        mass: 1,
        restitution: 0.5,
        friction: 0.1,
      })
      this.vehicleSystem.register(id)
    }

    this.arenaRenderer = new ArenaRenderer(this, this.map)
    this.arenaRenderer.draw()

    this.vehicleRenderer = new VehicleRenderer(this)
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  update(_time: number, delta: number): void {
    this.accumulator += delta

    while (this.accumulator >= STEP_MS) {
      this.accumulator -= STEP_MS

      const commands: VehicleCommand[] = this.collectCommands()
      this.vehicleSystem.update(_time, commands)
      this.engine.step(STEP_MS)
      this.vehicleSystem.postStep()
      this.updateZones()
    }

    const state = this.engine.getBodies()
    this.vehicleRenderer.draw(state)
  }

  private collectCommands(): VehicleCommand[] {
    const commands: VehicleCommand[] = []

    commands.push({
      vehicleId: 'vehicle_0',
      throttle: this.cursors.up.isDown ? 1 : 0,
      turn: this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0,
      boost: this.cursors.shift?.isDown ?? false,
    })

    return commands
  }

  private updateZones(): void {
    for (const state of this.engine.getBodies()) {
      const mod = this.zoneSystem.getModifierAt(state.x, state.y)
      this.vehicleSystem.setZoneModifiers(state.id, mod.frictionMultiplier, mod.maxSpeedMultiplier, mod.turnRateMultiplier)
    }
  }
}
