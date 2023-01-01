import { entityController } from "./entityController"
export class npcController extends entityController {
  constructor(npcId, npcInfo) {
    super()
    this.npcId = npcId
    this.npcInfo = npcInfo;
  }
}