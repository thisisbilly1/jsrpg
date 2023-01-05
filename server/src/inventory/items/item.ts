import { Client } from "../../client"
import networkContants from '../../../../networkConstants.json';
import { Inventory } from "../inventory";

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
  examine(inventory: Inventory) {
    inventory.player.client.send({
      id: networkContants.message,
      message: this.description
    })
  }

  drop(inventory: Inventory, index: number) {
    console.log('drop', index)
  }
}