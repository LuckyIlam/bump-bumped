import type { MapData, VehicleCommand } from '@bump-bumped/engine'
import { GamePhaseManager, GameState, MatterPhysicsEngine, parseMap, VehicleSystem, ZoneSystem } from '@bump-bumped/engine'
import Phaser from 'phaser'
import { SFXManager } from '../audio/SFXManager.js'
import { GamepadManager } from '../input/GamepadManager.js'
import { KeyboardManager } from '../input/KeyboardManager.js'
import classicMapData from '../map-data.json'
import { ArenaRenderer } from '../renderers/ArenaRenderer.js'
import { BoostEffects } from '../renderers/BoostEffects.js'
import { EliminationAnimation } from '../renderers/EliminationAnimation.js'
import { HUD } from '../renderers/HUD.js'
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
  private boostEffects!: BoostEffects
  private eliminationAnimation!: EliminationAnimation
  private hud!: HUD
  private map!: MapData
  private accumulator = 0
  private keyboardManager!: KeyboardManager
  private gamepadManager!: GamepadManager
  private phaseManager = new GamePhaseManager()
  private overlayContainer: Phaser.GameObjects.Container | null = null
  private prevBodiesSnapshot: { id: string; x: number; y: number; angle: number; shape: string }[] = []
  private sfx!: SFXManager
  private prevBoostStates = new Map<string, string>()

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
    const playerCount = (this.scene.settings.data as { playerCount?: number })?.playerCount
    this.gameState = new GameState(this.engine, this.vehicleSystem, this.map, undefined, playerCount)
    this.gameState.startMatch()

    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height)
    this.cameras.main.setScroll(0, 0)

    this.keyboardManager = new KeyboardManager(this)
    this.gamepadManager = new GamepadManager(this)

    this.arenaRenderer = new ArenaRenderer(this, this.map)
    this.arenaRenderer.draw()

    this.vehicleRenderer = new VehicleRenderer(this)
    this.boostEffects = new BoostEffects(this)
    this.eliminationAnimation = new EliminationAnimation(this)
    this.hud = new HUD(this)

    this.sfx = new SFXManager(this)

    this.engine.onCollision((event) => {
      const isVehicleCollision = event.bodyA.startsWith('vehicle_') && event.bodyB.startsWith('vehicle_')
      if (isVehicleCollision) {
        this.sfx.playCollision(Math.min(event.relativeVelocity / 15, 0.5))
      }
    })

    this.prevBodiesSnapshot = []
    this.prevBoostStates.clear()

    this.startCountdown()
  }

  update(_time: number, delta: number): void {
    this.boostEffects.update(delta, this.engine.getBodies(), this.vehicleSystem)
    this.eliminationAnimation.update(delta)

    this.detectBoostActivation()

    if (this.phaseManager.phase !== 'playing') {
      this.vehicleRenderer.draw(this.engine.getBodies())
      this.eliminationAnimation.draw()
      this.drawHUD()
      return
    }

    this.accumulator += delta

    while (this.accumulator >= STEP_MS) {
      this.accumulator -= STEP_MS

      this.prevBodiesSnapshot = this.engine.getBodies().map((b) => ({
        id: b.id,
        x: b.x,
        y: b.y,
        angle: b.angle,
        shape: b.shape,
      }))

      const commands: VehicleCommand[] = this.collectCommands()
      this.vehicleSystem.update(_time, commands)
      this.engine.step(STEP_MS)
      this.vehicleSystem.postStep()
      this.updateZones()
      this.gameState.update(_time, STEP_MS)

      this.detectEliminations()

      if (this.gameState.isRoundEnded()) {
        this.showRoundEnd()
        return
      }
    }

    this.vehicleRenderer.draw(this.engine.getBodies())
    this.eliminationAnimation.draw()
    this.drawHUD()
  }

  private detectEliminations(): void {
    const currentIds = new Set(this.engine.getBodies().map((b) => b.id))
    for (const prev of this.prevBodiesSnapshot) {
      if (!currentIds.has(prev.id)) {
        const hitter = this.gameState.lastVehicleHit.get(prev.id)
        let scoreText: string | undefined
        if (hitter) {
          const bounces = this.gameState.wallBounceCounts.get(prev.id) ?? 0
          const bonus = bounces >= 2 ? bounces * 2 : 0
          scoreText = bonus > 0 ? `+${1 + bonus}` : '+1'
        }
        this.eliminationAnimation.start(prev, scoreText)
        this.sfx.playElimination()
      }
    }
  }

  private detectBoostActivation(): void {
    for (const body of this.engine.getBodies()) {
      const state = this.vehicleSystem.getBoostState(body.id)
      if (!state) continue
      const prev = this.prevBoostStates.get(body.id) ?? 'idle'
      if (prev !== 'active' && state === 'active') {
        this.sfx.playBoost()
      }
      this.prevBoostStates.set(body.id, state)
    }
  }

  private drawHUD(): void {
    const snap = this.gameState.getSnapshot()
    this.hud.draw(snap.round.number, snap.match.totalRounds, snap.players, this.vehicleSystem)
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
        if (step.text === 'GO!') {
          this.sfx.playGo()
        } else {
          this.sfx.playCountdown()
        }

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
    this.sfx.playRoundEnd()
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
        this.eliminationAnimation.clear()
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
