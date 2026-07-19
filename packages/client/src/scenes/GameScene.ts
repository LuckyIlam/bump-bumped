import type { MapData, VehicleCommand } from '@bump-bumped/engine'
import { GamePhaseManager, GameState, MatterPhysicsEngine, parseMap, VehicleSystem, ZoneSystem } from '@bump-bumped/engine'
import Phaser from 'phaser'
import { GamepadManager } from '../input/GamepadManager.js'
import { KeyboardManager } from '../input/KeyboardManager.js'
import classicMapData from '../map-data.json'
import { ArenaRenderer } from '../renderers/ArenaRenderer.js'
import { VehicleRenderer } from '../renderers/VehicleRenderer.js'

const STEP_MS = 1000 / 60

const OVERLAY_COLORS = ['#ff3333', '#3388ff', '#ffcc00', '#33ff66']

export class GameScene extends Phaser.Scene {
  private engine!: MatterPhysicsEngine
  private vehicleSystem!: VehicleSystem
  private zoneSystem!: ZoneSystem
  private gameState!: GameState
  private arenaRenderer!: ArenaRenderer
  private vehicleRenderer!: VehicleRenderer
  private map!: MapData
  private accumulator = 0
  private keyboardManager!: KeyboardManager
  private gamepadManager!: GamepadManager
  private phaseManager = new GamePhaseManager()
  private overlayContainer: Phaser.GameObjects.Container | null = null

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
    this.gameState = new GameState(this.engine, this.vehicleSystem, this.map)
    this.gameState.startMatch()

    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height)
    this.cameras.main.setScroll(0, 0)

    this.keyboardManager = new KeyboardManager(this)
    this.gamepadManager = new GamepadManager(this)

    this.arenaRenderer = new ArenaRenderer(this, this.map)
    this.arenaRenderer.draw()

    this.vehicleRenderer = new VehicleRenderer(this)

    this.startCountdown()
  }

  update(_time: number, delta: number): void {
    if (this.phaseManager.phase !== 'playing') {
      const state = this.engine.getBodies()
      this.vehicleRenderer.draw(state)
      return
    }

    this.accumulator += delta

    while (this.accumulator >= STEP_MS) {
      this.accumulator -= STEP_MS

      const commands: VehicleCommand[] = this.collectCommands()
      this.vehicleSystem.update(_time, commands)
      this.engine.step(STEP_MS)
      this.vehicleSystem.postStep()
      this.updateZones()
      this.gameState.update(_time, STEP_MS)

      if (this.gameState.isRoundEnded()) {
        this.showRoundEnd()
        return
      }
    }

    const state = this.engine.getBodies()
    this.vehicleRenderer.draw(state)
  }

  private startCountdown(): void {
    this.phaseManager.startCountdown()
    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    const steps = [
      { text: '3', delay: 0 },
      { text: '2', delay: 1000 },
      { text: '1', delay: 2000 },
      { text: 'GO!', delay: 3000 },
    ]

    for (const step of steps) {
      this.time.delayedCall(step.delay, () => {
        const t = this.add
          .text(cx, cy, step.text, {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: 'monospace',
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(500)

        this.time.delayedCall(800, () => {
          t.destroy()
        })
      })
    }

    this.time.delayedCall(3800, () => {
      this.phaseManager.onCountdownComplete()
    })
  }

  private showRoundEnd(): void {
    const snap = this.gameState.getSnapshot()
    const info = this.phaseManager.onRoundEnded(snap)
    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    this.overlayContainer?.destroy(true)
    this.overlayContainer = this.add.container(0, 0).setDepth(500)

    this.overlayContainer.add(this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6).setScrollFactor(0))

    const titleText = info.winnerPlayer
      ? `Manche ${info.roundNumber} — Joueur ${info.winnerPlayer.index + 1} remporte la manche !`
      : 'Manche terminée !'

    this.overlayContainer.add(
      this.add
        .text(cx, cy - 100, titleText, {
          fontSize: '28px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setScrollFactor(0),
    )

    let sy = cy - 40
    for (const p of info.sortedPlayers) {
      const isWinner = p.id === info.winnerId
      const prefix = isWinner ? '★ ' : '  '
      this.overlayContainer.add(
        this.add
          .text(cx, sy, `${prefix}Joueur ${p.index + 1}  —  ${p.score} pt${p.score > 1 ? 's' : ''}`, {
            fontSize: '18px',
            color: OVERLAY_COLORS[p.colorIndex],
            fontFamily: 'monospace',
          })
          .setOrigin(0.5)
          .setScrollFactor(0),
      )
      sy += 32
    }

    this.time.delayedCall(3500, () => {
      this.overlayContainer?.destroy(true)
      this.overlayContainer = null

      const action = this.phaseManager.dismissOverlay(this.gameState.isMatchFinished())

      if (action === 'matchEnd') {
        this.scene.start('MatchEndScene', { snapshot: this.gameState.getSnapshot() })
      } else {
        this.gameState.startRound()
        this.startCountdown()
      }
    })
  }

  private collectCommands(): VehicleCommand[] {
    const commands: VehicleCommand[] = []

    commands.push(this.keyboardManager.getP1Command('vehicle_0'))
    commands.push(this.keyboardManager.getP2Command('vehicle_1'))

    const gamepadCommands = this.gamepadManager.getCommands()
    for (const cmd of gamepadCommands) {
      commands.push(cmd)
    }

    return commands
  }

  private updateZones(): void {
    for (const state of this.engine.getBodies()) {
      const mod = this.zoneSystem.getModifierAt(state.x, state.y)
      this.vehicleSystem.setZoneModifiers(state.id, mod.frictionMultiplier, mod.maxSpeedMultiplier, mod.turnRateMultiplier)
    }
  }
}
