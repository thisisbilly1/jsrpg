

import { entityController } from "../entityController"

export class playerController extends entityController {
  constructor(pid, username) {
    super()
    this.pid = pid
    this.username = username
    this.setEquipment = () => {
      console.warn('set me in a react three fiber component')
    }
  }

  handlEquipment({ head, body, legs, weapon, shield }) {
    this.setEquipment(null)
    this.setEquipment({
      head,
      body,
      legs,
      weapon,
      shield
    })
  }
}