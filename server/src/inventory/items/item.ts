import { Client } from "../../client"
import networkContants from '../../../../networkConstants.json';

interface options {
  [x: string | number | symbol]: Function
}

export class Item {
  name: string
  description: string
  options: options
  constructor() {
    this.name = 'item name'
    this.description = 'item description'
    this.options = {
      examine: this.examine,
      drop: this.drop,
    }
  }
  examine(client: Client) {
    client.send({
      id: networkContants.message,
      message: this.description
    })
  }

  drop(client: Client) {
    console.log('drop')
  }
}