import { Item } from "./items/item"
import networkContants from '../../../networkConstants.json';

// test for now
import { bodyTest } from "./items/bodyTest"
import { Client } from "../client"

export class Inventory {
  items: (Item | undefined)[]
  client: Client
  constructor(client: Client) {
    this.client = client
    // inventory should always be 30
    this.items = [
      new bodyTest(),
      ...new Array(29)
    ]
  }

  clickOption(index: number, action: string) {
    const item = this.items[index]
    if (!item) return
    if (!item.options[action]) return
    item.options[action].bind(item)(this.client)
  }

  swapItems(index1: number, index2: number) {
    [this.items[index1], this.items[index2]] = [this.items[index2], this.items[index1]];
    this.updateInventory()
  }

  updateInventory() {
    this.client.send({
      id: networkContants.inventory,
      items: this.items.map(item => item && ({
        name: item.name,
        options: Object.keys(item.options)
      }))
    })
  }
}