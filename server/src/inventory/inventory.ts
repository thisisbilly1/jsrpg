import { Item } from "./items/item"
import networkContants from '../../../networkConstants.json';

// test for now
import { bodyTest } from "./items/bodyTest"
import { Player } from "../entities/player";
import { Equipment } from "./equipment";
export class Inventory {
  items: (Item | null)[]
  player: Player
  public static maxItems: number = 30

  equipment: Equipment
  constructor(player: Player) {
    this.player = player
    // inventory should always be 30
    this.items = [
      new bodyTest(),
      ...new Array(Inventory.maxItems - 1)
    ]
    this.equipment = new Equipment(this)
  }

  clickOption(index: number, action: string) {
    const item = this.items[index]
    if (!item) return
    if (!item.options[action]) return
    item.options[action].bind(item)(this, index)
  }

  swapItems(index1: number, index2: number) {
    [this.items[index1], this.items[index2]] = [this.items[index2], this.items[index1]];
    this.updateInventory()
  }

  updateAll() {
    this.updateInventory()
    this.equipment.updateEquipment(this.player.client)
  }

  updateInventory() {
    this.player.client.send({
      id: networkContants.inventory,
      items: this.items.map(item => item && ({
        name: item.name,
        options: Object.keys(item.options)
      }))
    })
  }

  addItem(item: Item) {
    // Find empty slot
    for(let i=0; i<Inventory.maxItems; i++) {
      const slot = this.items[i];
      if (!slot) {
        this.items[i] = item
        break
      }
    }
    console.log(this.items)
    this.updateInventory()
  }
}