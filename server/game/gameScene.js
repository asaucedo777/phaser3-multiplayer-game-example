import geckos from '@geckos.io/server'
import { iceServers } from '@geckos.io/server'
import pkg from 'phaser'
const { Scene } = pkg

import { Player } from './components/player.js'
import { SERVER_EVENTS } from './../constantsServer.js'

export class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId = 0
  }
  init() {
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : []
    })
    this.io.addServer(this.game.server)
    console.log('Scene initialized')
  }
  getId() {
    return this.playerId++
  }
  prepareToSync(player) {
    return `${player.playerId},${Math.round(player.x).toString(36)},${Math.round(player.y).toString(36)},${
      player.dead === true ? 1 : 0
    },`
  }
  getState() {
    let state = ''
    this.playersGroup.children.iterate(player => {
      state += this.prepareToSync(player)
    })
    return state
  }
  create() {
    this.playersGroup = this.add.group()
    this.io.onConnection(channel => {
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        this.playersGroup.children.each(player => {
          if (player.playerId === channel.playerId) {
            player.kill()
          }
        })
        channel.room.emit(SERVER_EVENTS.REMOVE_PLAYER, channel.playerId)
        console.log('Scene create disconnect')
      })
      channel.on(SERVER_EVENTS.ADD_DUMMY, () => {
        let x = Phaser.Math.RND.integerInRange(50, 800)
        let y = Phaser.Math.RND.integerInRange(100, 400)
        let id = Math.random()
        let dead = this.playersGroup.getFirstDead()
        if (dead) {
          dead.revive(id, true)
          dead.setPosition(x, y)
        } else {
          this.playersGroup.add(new Player(this, id, x, y, true))
        }
        console.log('Scene create addDummy')
      })
      channel.on(SERVER_EVENTS.GET_ID, () => {
        channel.playerId = this.getId()
        channel.emit(SERVER_EVENTS.GET_ID, channel.playerId.toString(36))
        console.log('Scene create getId')
      })
      channel.on(SERVER_EVENTS.PLAYER_MOVE, data => {
        this.playersGroup.children.iterate(player => {
          if (player.playerId === channel.playerId) {
            player.setMove(data)
          }
        })
        // console.log('Scene create playerMove')
      })
      channel.on(SERVER_EVENTS.ADD_PLAYER, data => {
        let dead = this.playersGroup.getFirstDead()
        if (dead) {
          dead.revive(channel.playerId, false)
        } else {
          this.playersGroup.add(new Player(this, channel.playerId, Phaser.Math.RND.integerInRange(100, 700)))
        }
        console.log('Scene create addPlayer')
      })
      channel.emit(SERVER_EVENTS.READY)
      console.log('Scene create onConnection')
    })
  }
  update() {
    let updates = ''
    this.playersGroup.children.iterate(player => {
      let x = Math.abs(player.x - player.prevX) > 0.5
      let y = Math.abs(player.y - player.prevY) > 0.5
      let dead = player.dead != player.prevDead
      if (x || y || dead) {
        if (dead || !player.dead) {
          updates += this.prepareToSync(player)
        }
      }
      player.postUpdate()
    })
    if (updates.length > 0) {
      this.io.room().emit(SERVER_EVENTS.UPDATE_OBJECTS, [updates])
    }
    //console.log('Scene update')
  }
}
