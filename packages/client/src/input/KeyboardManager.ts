import type { VehicleCommand } from '@bump-bumped/engine'
import Phaser from 'phaser'

interface KeySet {
  throttle: Phaser.Input.Keyboard.Key
  turnLeft: Phaser.Input.Keyboard.Key
  turnRight: Phaser.Input.Keyboard.Key
  boost: Phaser.Input.Keyboard.Key
}

/** Manages keyboard input for players 1 (ZQSD) and 2 (arrows). */
export class KeyboardManager {
  private p1: KeySet
  private p2: KeySet

  /** @param scene - Phaser scene to bind keyboard events to. */
  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard
    if (!kb) {
      this.p1 = {} as KeySet
      this.p2 = {} as KeySet
      return
    }

    this.p1 = {
      throttle: kb.addKey('Z'),
      turnLeft: kb.addKey('Q'),
      turnRight: kb.addKey('D'),
      boost: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    }

    const cursors = kb.createCursorKeys()
    this.p2 = {
      throttle: cursors.up,
      turnLeft: cursors.left,
      turnRight: cursors.right,
      boost: kb.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
    }
  }

  /** Returns the current command for player 1 (Z = throttle, Q = left, D = right, SHIFT = boost). */
  getP1Command(vehicleId: string): VehicleCommand {
    return {
      vehicleId,
      throttle: this.p1.throttle?.isDown ? 1 : 0,
      turn: this.p1.turnLeft?.isDown ? -1 : this.p1.turnRight?.isDown ? 1 : 0,
      boost: this.p1.boost?.isDown ?? false,
    }
  }

  /** Returns the current command for player 2 (↑ = throttle, ← = left, → = right, CTRL = boost). */
  getP2Command(vehicleId: string): VehicleCommand {
    return {
      vehicleId,
      throttle: this.p2.throttle?.isDown ? 1 : 0,
      turn: this.p2.turnLeft?.isDown ? -1 : this.p2.turnRight?.isDown ? 1 : 0,
      boost: this.p2.boost?.isDown ?? false,
    }
  }
}
