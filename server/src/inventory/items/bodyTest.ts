import { Client } from "../../client"
import { Item } from "./item"
export class bodyTest extends Item {
  constructor() {
    super()
    this.name = 'Body Test'
    this.description = 'uh oh stinky body lol'
    this.options = {
      equip: this.equip,
      examine: this.examine,
      drop: this.drop,
    }
  }

  equip(client: Client) {
    console.log('equip')
  }
}