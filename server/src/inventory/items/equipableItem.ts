import { Inventory } from "../inventory"
import { Item } from "./item"

export enum slot {
  body = "body",
  legs = "legs",
  head = "head",
  weapon = "weapon",
  shield = "shield"
}

export class EquipableItem extends Item {
  slot: slot
  constructor() {
    super()
    this.slot = slot.body
    this.options = {
      equip: this.equip,
      examine: this.examine,
      drop: this.drop,
    }
  }

  equip(inventory: Inventory, index: number) {
    inventory.items[index] = null
    inventory.equipment.equipment[this.slot] = this
    inventory.updateAll()
  }
}