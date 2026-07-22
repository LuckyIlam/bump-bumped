import type { MapData, VehicleCommand } from '@bump-bumped/engine'
import { GameEngine, GamePhaseManager, parseMap, vehicleId } from '@bump-bumped/engine'
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

/** Main game scene — orchestrates the game loop, rendering, and input collection. */
export class GameScene extends Phaser.Scene {
  private gameEngine!: GameEngine
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
  private sfx!: SFXManager

  /** Registers the scene under the key 'GameScene'. */
  constructor() {
    super('GameScene')
  }

  /** Phaser lifecycle — sets up the engine, renderers, input, and event subscriptions. */
  create(): void {
    const result = parseMap(JSON.stringify(classicMapData))
    if (!result.ok) {
      throw new Error(`Failed to parse map: ${result.error}`)
    }
    this.map = result.value

    const playerCount = (this.scene.settings.data as { playerCount?: number })?.playerCount
    this.gameEngine = new GameEngine(this.map, playerCount)

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

    this.gameEngine.eventBus.on((event) => {
      switch (event.type) {
        case 'elimination':
          this.eliminationAnimation.start(
            { x: event.position.x, y: event.position.y, shape: event.shape, colorIndex: event.colorIndex },
            event.hitter ? `+${1 + (event.bounces >= 2 ? event.bounces * 2 : 0)}` : undefined,
          )
          this.sfx.playElimination()
          break
        case 'vehicleCollision':
          this.sfx.playCollision(Math.min(event.relativeVelocity / 15, 0.5))
          break
        case 'boostActivation':
          this.sfx.playBoost()
          break
      }
    })

    this.startCountdown()
  }

  /** Phaser lifecycle — fixed-step game loop with accumulator. */
  update(_time: number, delta: number): void {
    this.boostEffects.update(delta, this.gameEngine.getBodies(), this.gameEngine.boostStatus)
    this.eliminationAnimation.update(delta)

    if (this.phaseManager.phase !== 'playing') {
      this.vehicleRenderer.draw(this.gameEngine.getBodies())
      this.eliminationAnimation.draw()
      this.drawHUD()
      return
    }

    this.accumulator += delta

    while (this.accumulator >= STEP_MS) {
      this.accumulator -= STEP_MS

      const commands: VehicleCommand[] = this.collectCommands()
      this.gameEngine.step(_time, STEP_MS, commands)

      if (this.gameEngine.isRoundEnded()) {
        this.showRoundEnd()
        return
      }
    }

    this.vehicleRenderer.draw(this.gameEngine.getBodies())
    this.eliminationAnimation.draw()
    this.drawHUD()
  }

  /** Draws the HUD (round info, boost charge, scores). */
  private drawHUD(): void {
    const snap = this.gameEngine.getSnapshot()
    this.hud.draw(snap.round.number, snap.match.totalRounds, snap.players, this.gameEngine.boostStatus)
  }

  /** Displays the 3-2-1-GO! countdown overlay. */
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

  /** Shows the round-end overlay with scores and transitions to next round or match end. */
  private showRoundEnd(): void {
    const snap = this.gameEngine.getSnapshot()
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

      const action = this.phaseManager.dismissOverlay(this.gameEngine.isMatchFinished())

      if (action === 'matchEnd') {
        this.scene.start('MatchEndScene', { snapshot: this.gameEngine.getSnapshot() })
      } else {
        this.gameEngine.startNewRound()
        this.eliminationAnimation.clear()
        this.startCountdown()
      }
    })
  }

  /** Gathers input commands from keyboard + gamepads for the current frame. */
  private collectCommands(): VehicleCommand[] {
    const commands: VehicleCommand[] = []

    commands.push(this.keyboardManager.getP1Command(vehicleId(0)))
    commands.push(this.keyboardManager.getP2Command(vehicleId(1)))

    const gamepadCommands = this.gamepadManager.getCommands()
    for (const cmd of gamepadCommands) {
      commands.push(cmd)
    }

    return commands
  }
}
