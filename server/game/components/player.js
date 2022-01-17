export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerId, x = 200, y = 200, dummy = false) {
    super(scene, x, y, '')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.scene = scene
    this.prevX = -1
    this.prevY = -1
    this.dead = false
    this.prevDead = false
    this.playerId = playerId
    this.move = {}
    this.setDummy(dummy)
    this.body.setSize(32, 48)
    this.prevNoMovement = true
    this.setCollideWorldBounds(true)
    scene.events.on('update', this.update, this)
    console.log('Player %d', this.playerId)
  }
  setDummy(dummy) {
    if (dummy) {
      this.body.setBounce(1)
      this.scene.time.addEvent({
        delay: Phaser.Math.RND.integerInRange(45, 90) * 1000,
        callback: () => this.kill()
      })
    } else {
      this.body.setBounce(0)
    }
  }
  kill() {
    this.dead = true
    this.setActive(false)
    console.log('Player %d killed', this.playerId)
  }
  revive(playerId, dummy) {
    this.playerId = playerId
    this.dead = false
    this.setActive(true)
    this.setDummy(dummy)
    this.setVelocity(0)
    console.log('Player %d revived', this.playerId)
  }
  setMove(data) {
    let int = parseInt(data, 36)
    let move = {
      left: int === 1 || int === 5,
      right: int === 2 || int === 6,
      up: int === 4 || int === 6 || int === 5,
      none: int === 8
    }
    this.move = move
    // console.log('Player %d moved', this.playerId)
  }
  update() {
    if (this.move.left) this.setVelocityX(-160)
    else if (this.move.right) this.setVelocityX(160)
    else this.setVelocityX(0)
    if (this.move.up && this.body.onFloor()) this.setVelocityY(-550)
    // console.log('Player %d updated', this.playerId)
  }
  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevDead = this.dead
    // console.log('Player %d postupdated', this.playerId)
  }
}
