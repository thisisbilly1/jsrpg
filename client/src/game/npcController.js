import { entityController } from "./entityController"
import networkConstants from '../../../networkConstants.json';

export class npcController extends entityController {
  constructor(npcId, client) {
    super()
    this.npcId = npcId
    this.client = client;
  }

  startChat() {
    this.client.send({
      id: networkConstants.npcChat,
      npcId: this.npcId
    })
  }
}