import networkContants from '../../../../networkConstants.json';
import { Inventory } from "../inventory";

interface options {
  [x: string | number | symbol]: Function
}

export class Item {
  public static schema: Realm.ObjectSchema = {
    name: "item",
    primaryKey: "name",
    properties: {
      name: "string",
      amount: "int"
    }
  }
  public name: string
  public description: string
  public options: options
  public amount: number
  public stackable: boolean
  constructor() {
    this.name = 'item name'
    this.description = 'item description'
    this.options = {
      examine: this.examine,
      drop: this.drop,
    }
    this.stackable = false
    this.amount = 1
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