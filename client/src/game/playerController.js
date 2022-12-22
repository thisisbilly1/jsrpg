

export class playerController {
  constructor(pid) {
    this.pid = pid;
    this.position = [0,0,0]

  }
  handleMove({x,y,z}) {
    this.position = [x,y,z];
    // console.log(x,y,z)
    // this.position = [
    //   lerp(this.position[0], x, .02),
    //   lerp(this.position[1], y, .02),
    //   lerp(this.position[2], z, .02)
    // ]
  }
}