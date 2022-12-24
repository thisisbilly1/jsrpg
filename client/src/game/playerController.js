

export class playerController {
  constructor(pid, username) {
    this.pid = pid
    this.username = username
    this.position = [0,0,0]
  }
  handleMove({x,y,z}) {
    this.position = [x,y,z];
  }
}