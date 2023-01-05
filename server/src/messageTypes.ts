import { slot } from "./inventory/items/equipableItem"

export interface message {
  id: Number
  [x: string | number | symbol]: unknown
}

export interface messageMove extends message {
  forward: Boolean
  back: Boolean
  left: Boolean
  right: Boolean
  jump: Boolean
  angle: number
}

enum inventoryActionType {
  requestInventory = 'requestInventory',
  clickOption = 'clickOption',
  swap = 'swap',
}


export interface messageEquipment extends message {
  slot: slot
}
export interface messageInventory extends message {
  type: inventoryActionType
}


export interface inventoryClickOption extends messageInventory {
  itemIndex: number
  action: string
}

export interface inventorySwap extends messageInventory {
  itemIndex1: number
  itemIndex2: number
}