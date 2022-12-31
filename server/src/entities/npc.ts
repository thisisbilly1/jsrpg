import { Vector3 } from 'three'
import { Entity } from './entity'

const upVector = new Vector3(0, 1, 0)
const tempVector = new Vector3()

export class NPC extends Entity {
  id: number
  canWander: Boolean
  wandering: Boolean
  wanderChance: number
  wanderStopChance: number
  constructor(id: number) {
    super();
    this.id = id
    this.canWander = true
    this.wandering = false
    this.wanderChance = 0.1
    this.wanderStopChance = 0.7
  }

  controls(delta: number) {
    // TODO: add better wandering 
    if (!this.canWander) return
    if (this.wandering) {
      tempVector.set(0, 0, - 1).applyAxisAngle(upVector, this.angle)
      this.mesh.position.addScaledVector(tempVector, this.speed * delta)
      if (Math.random() <= this.wanderStopChance * delta) {
        this.wandering = false
      }
    } else {
      if (Math.random() <= this.wanderChance * delta) {
        // set rotation to random for now
        this.angle = Math.random() * 2 * Math.PI
        this.wandering = true
      }
    }


    this.mesh.updateMatrixWorld()
  }
}