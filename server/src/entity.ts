import { entity, camera, keyInputs, location } from './entityTypes'

export class Entity implements entity {
  location: location
  camera: camera
  keyInputs: keyInputs
  grounded: Boolean
  yVelocity: number
  gravityAcceleration: number
  constructor() {
    this.location = {
      x: 0,
      y: 500,
      z: 0
    }

    this.keyInputs = {
      forward: false,
      back: false,
      left: false,
      right: false,
      jump: false,
    };

    this.camera = {
      x: 0,
      y: 0,
      z: 0,
    }

    this.grounded = true
    this.yVelocity = 0
    this.gravityAcceleration = 5
  }

  update(timeElapsed: number) {
    const foward = this.keyInputs.forward ? 1 : 0
    const backward = this.keyInputs.back ? -1 : 0

    const left = this.keyInputs.left ? 1 : 0
    const right = this.keyInputs.right ? -1 : 0
    this.location.z += (foward + backward) * timeElapsed
    this.location.x += (right + left) * timeElapsed

    // jumping
    this.yVelocity += this.gravityAcceleration
    this.grounded = this.location.y <= 0

    if (this.grounded) {
      this.yVelocity = 0
      if (this.keyInputs.jump) {
        this.yVelocity = -10
      }
    }
    this.location.y -= this.yVelocity;
  }
}