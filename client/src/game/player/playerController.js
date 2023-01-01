

import { entityController } from "../entityController"

export class playerController extends entityController {
  constructor(pid, username) {
    super()
    this.pid = pid
    this.username = username
  }
}