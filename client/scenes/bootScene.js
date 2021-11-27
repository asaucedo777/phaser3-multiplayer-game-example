import { Scene } from 'phaser'
import geckos from '@geckos.io/client'
import { CLIENT_EVENTS } from '../constants.js'

export default class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' })
    const channel = geckos({ port: 1444 })
    channel.onConnect(error => {
      if (error) console.error(error.message)
    })
    channel.on(CLIENT_EVENTS.READY, () => {
      this.scene.start('GameScene', { channel: channel })
    })
  }
}
