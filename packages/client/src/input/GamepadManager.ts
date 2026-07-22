import type { VehicleCommand } from '@bump-bumped/engine'
import { vehicleId } from '@bump-bumped/engine'
import type Phaser from 'phaser'

const THROTTLE_DEAD_ZONE = 0.15
const TURN_DEAD_ZONE = 0.15

/** Manages gamepad input for up to 4 pads (mapped to players 3-6). */
export class GamepadManager {
  private plugin: Phaser.Input.Gamepad.GamepadPlugin | null

  /** @param scene - Phaser scene to read the gamepad plugin from. */
  constructor(scene: Phaser.Scene) {
    this.plugin = scene.input.gamepad
  }

  /** Returns commands from all connected gamepads (R2 = throttle, left stick = turn, A = boost). */
  getCommands(): VehicleCommand[] {
    const commands: VehicleCommand[] = []

    if (!this.plugin) {
      return commands
    }

    for (let i = 0; i < 4; i++) {
      const pad = this.plugin.getPad(i)
      if (!pad?.connected) continue

      const throttle = pad.R2 > THROTTLE_DEAD_ZONE ? pad.R2 : 0
      const turnAx = Math.abs(pad.leftStick.x) > TURN_DEAD_ZONE ? pad.leftStick.x : 0
      const boost = pad.A

      commands.push({
        vehicleId: vehicleId(i + 2),
        throttle,
        turn: turnAx,
        boost,
      })
    }

    return commands
  }
}
