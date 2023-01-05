import { EquipableItem, slot } from "./equipableItem"
export class bodyTest extends EquipableItem {
  constructor() {
    super()
    this.name = 'Body Test'
    this.description = 'uh oh stinky body lol'
    this.slot = slot.body
  }
}