import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene.js'
import { MatchEndScene } from './scenes/MatchEndScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { PlayerSelectScene } from './scenes/PlayerSelectScene.js'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game',
  backgroundColor: '#1a1a2e',
  scene: [MenuScene, PlayerSelectScene, GameScene, MatchEndScene],
  input: {
    gamepad: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

new Phaser.Game(config)
