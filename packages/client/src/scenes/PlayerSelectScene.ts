import Phaser from 'phaser'
import { SFXManager } from '../audio/SFXManager.js'

const SLOT_COLORS = [0xff3333, 0x3388ff, 0xffcc00, 0x33ff66]
const SLOT_COLOR_STRS = ['#ff3333', '#3388ff', '#ffcc00', '#33ff66']
const CIRCLE_RADIUS = 10
const CIRCLE_X = 300
const LABEL_X = 330
const SLOT_START_Y = 210
const SLOT_GAP = 60

const SLOTS = [
  { label: 'Joueur 1', device: 'Z (accélérer) / Q (gauche) / D (droite) / SHIFT (boost)', autoReady: true },
  { label: 'Joueur 2', device: '↑ (accélérer) / ← (gauche) / → (droite) / SHIFT (boost)', autoReady: true },
  { label: 'Joueur 3', device: '', autoReady: false },
  { label: 'Joueur 4', device: '', autoReady: false },
]

export class PlayerSelectScene extends Phaser.Scene {
  private statusTexts: Phaser.GameObjects.Text[] = []
  private slotDeviceTexts: Phaser.GameObjects.Text[] = []
  private countdownText: Phaser.GameObjects.Text | null = null
  private autoStartCountdown = -1
  private hasAutoStarted = false
  private sfx!: SFXManager
  private prevReadyCount = 0

  constructor() {
    super('PlayerSelectScene')
  }

  create(): void {
    this.sfx = new SFXManager(this)
    const { width, height } = this.scale

    this.add
      .text(width / 2, 50, 'BUMP & BUMPED', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 100, 'SÉLECTION DES JOUEURS', {
        fontSize: '22px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.drawSlots(width)

    this.add
      .text(width / 2, height - 80, 'ESPACE ou START pour commencer', {
        fontSize: '16px',
        color: '#88ff88',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.setupInput()
  }

  update(): void {
    if (this.hasAutoStarted) return

    const readyCount = this.statusTexts.filter((t) => t.text === 'PRÊT').length
    if (readyCount > this.prevReadyCount) {
      this.sfx.playPlayerReady()
    }
    this.prevReadyCount = readyCount

    if (readyCount < 2) return

    if (this.autoStartCountdown < 0) {
      this.autoStartCountdown = 180
    }

    this.autoStartCountdown--
    const sec = Math.ceil(this.autoStartCountdown / 60)
    if (!this.countdownText) {
      const { width, height } = this.scale
      this.countdownText = this.add
        .text(width / 2, height - 120, `Démarrage dans ${sec}...`, {
          fontSize: '20px',
          color: '#ffff88',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
    } else {
      this.countdownText.setText(`Démarrage dans ${sec}...`)
    }

    if (this.autoStartCountdown === 0) {
      this.hasAutoStarted = true
      this.startGame()
    }
  }

  private drawSlots(width: number): void {
    for (let i = 0; i < 4; i++) {
      const y = SLOT_START_Y + i * SLOT_GAP
      const slot = SLOTS[i]

      const gfx = this.add.graphics()
      gfx.fillStyle(SLOT_COLORS[i], 1)
      gfx.fillCircle(CIRCLE_X, y, CIRCLE_RADIUS)

      this.add
        .text(LABEL_X, y, slot.label, {
          fontSize: '16px',
          color: SLOT_COLOR_STRS[i],
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0.5)

      const deviceText = this.add
        .text(LABEL_X + 120, y, '', {
          fontSize: '13px',
          color: '#888888',
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0.5)
      this.slotDeviceTexts.push(deviceText)

      const statusText = this.add
        .text(width - 120, y, '', {
          fontSize: '13px',
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0.5)
      this.statusTexts.push(statusText)
    }

    this.refreshSlots()
  }

  private refreshSlots(): void {
    for (let i = 0; i < 4; i++) {
      if (i < 2) {
        this.slotDeviceTexts[i].setText(SLOTS[i].device)
        this.statusTexts[i].setText('PRÊT').setColor('#88ff88')
      } else {
        const padIndex = i - 2
        const gp = this.input.gamepad
        const pad = gp?.getPad(padIndex)
        if (pad?.connected) {
          this.slotDeviceTexts[i].setText(`Manette ${padIndex + 1} : R2 / stick gauche / A`)
          this.statusTexts[i].setText('PRÊT').setColor('#88ff88')
        } else {
          this.slotDeviceTexts[i].setText(`Manette ${padIndex + 1} : en attente...`)
          this.statusTexts[i].setText('ATTENTE').setColor('#666666')
        }
      }
    }
  }

  private setupInput(): void {
    const gp = this.input.gamepad
    const kb = this.input.keyboard

    if (kb) {
      kb.once('keydown-SPACE', () => {
        this.startGame()
      })
    }

    if (gp) {
      gp.on('connected', () => {
        this.refreshSlots()
      })
      gp.on('disconnected', () => {
        this.refreshSlots()
      })
      gp.once('down', () => {
        this.startGame()
      })
    }
  }

  private startGame(): void {
    const readyCount = this.statusTexts.filter((t) => t.text === 'PRÊT').length
    this.sfx.playMenuSelect()
    this.scene.start('GameScene', { playerCount: readyCount })
  }
}
