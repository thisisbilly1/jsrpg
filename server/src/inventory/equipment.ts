import { Item } from "./items/item"
import networkContants from '../../../networkConstants.json';

import { Client } from "../client"
import { Inventory } from "./inventory";
import { slot } from "./items/equipableItem";

interface equipment {
  head: null | Item
  body: null | Item
  legs: null | Item
  weapon: null | Item
  shield: null | Item
}

export class Equipment {
  inventory: Inventory
  equipment: equipment
  constructor(inventory: Inventory) {
    this.equipment = {
      head: null,
      body: null,
      legs: null,
      weapon: null,
      shield: null,
    }
    this.inventory = inventory
  }

  unequip(slot: slot) {
    const freeInvSpot = this.inventory.items.indexOf(null)
    if (freeInvSpot !== -1) {
      this.inventory.items[freeInvSpot] = this.equipment[slot]
      this.equipment[slot] = null
      this.inventory.updateAll()
    }
  }

  updateEquipment(client: Client) {
    client.server.sendAll({
      id: networkContants.equipment,
      pid: client.pid,
      // send all the items
      ...Object.entries(this.equipment).reduce((prev, curr) => {
        const [key, item] = curr;
        if (item) {
          return {
            ...prev,
            [key]: item.name
          }
        }
        return prev;
      }, {})
    })
  }
}