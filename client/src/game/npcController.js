

export class npcController {
  constructor(npcId, npcInfo) {
    this.npcId = npcId
    this.npcInfo = npcInfo;
    this.position = [0,0,0]
  }
  handleMove({x,y,z}) {
    this.position = [x,y,z];
  }
}