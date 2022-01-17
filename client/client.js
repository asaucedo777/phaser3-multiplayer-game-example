//// <reference path="../phaser.d.ts" />
import 'core-js/stable'
import Phaser, { Game } from 'phaser'

import BootScene from './scenes/bootScene'
import GameScene from './scenes/gameScene'
import FullScreenEvent from './components/fullscreenEvent'
import { CLIENT_EVENTS } from './constants'

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 896,
    height: 504
  },
  scene: [BootScene, GameScene]
}
console.log('client loading...')
window.addEventListener(CLIENT_EVENTS.LOAD, () => {
  const game = new Game(config)
  FullScreenEvent(() => resize(game))
  console.log('client loaded')
})
