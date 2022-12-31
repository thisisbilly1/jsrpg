

const states = {
  idle: 'idle',
  walking: 'walking',
  falling: 'fall'
}

export class playerController {
  constructor(pid, username) {
    this.pid = pid
    this.username = username

    this.position = [0,0,0]
    this.grounded = false

    this.lastUpdatedPosition = 0
    this.rotation = 0

    this.state = 'idle'
    this.desiredState = 'idle'

    this.setState = () => {
      console.warn('set me in a react three fiber component')
    }
  }
  x() {
    return this.position[0]
  }
  y() {
    return this.position[1]
  }
  z() {
    return this.position[2]
  }
  handleMove({ x, y, z }) {
    const dx = this.x() - x
    const dz = this.z() - z
    const dy = this.y() - y

    // calc rotation
    this.rotation = Math.atan2(dx, dz)

    if (this.grounded) {
      if (dx !== 0 && dz !== 0) {
        this.desiredState = states.walking
      }
    } else {
      if (dy !== 0) this.desiredState = states.falling
    }
    this.position = [x,y,z];
    this.lastUpdatedPosition = 0
  }

  updateStates() {
    if (this.state === this.desiredState) return
    this.state = this.desiredState
    this.setState(this.state)
  }
  update(delta) {
    // check if the person is no longer moving
    this.lastUpdatedPosition += delta
    if (this.lastUpdatedPosition > 0.05) {
      this.desiredState = states.idle
    }
    this.updateStates()
  }
}