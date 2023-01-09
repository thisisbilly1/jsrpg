import { Vector3 } from 'three'
import { Entity } from './entity'
import { Chat } from './chat'
import { Client } from '../client'
import { serverType } from '../app'
import { Item } from '../inventory/items/item'
import { bodyTest } from '../inventory/items/bodyTest'


const upVector = new Vector3(0, 1, 0)
const tempVector = new Vector3()

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}
export class NPC extends Entity {
  id: number
  canWander: boolean
  wandering: boolean
  wanderChance: number
  wanderStopChance: number
  dialogueLocation: String
  talkingTo: Set<number>
  targetPosition: Vector3 | null
  server: serverType
  commands: Map<string, Function>

  constructor(id: number, server: serverType) {
    super();
    this.id = id
    this.canWander = true
    this.wandering = false
    this.wanderChance = 0.1
    this.wanderStopChance = 0.7
    this.dialogueLocation = "./src/assets/npcs/bob.yarn"
    this.talkingTo = new Set()
    this.targetPosition = null
    this.server = server
    this.commands = new Map();
    this.commands.set("addItem", this.addItem)
  }

  controls(delta: number) {
    if (this.targetPosition) {
      const dx = this.mesh.position.x - this.targetPosition.x
      const dz = this.mesh.position.z - this.targetPosition.z
      const angle = Math.atan2(dx, dz)
      tempVector.set(0, 0, - 1).applyAxisAngle(upVector, angle)
      this.mesh.position.addScaledVector(tempVector, this.speed * delta)
      this.checkTargetDistance()
    }
    this.wander(delta)

    this.mesh.updateMatrixWorld()
  }

  wander(delta: number) {
    if (!this.canWander || this.talkingTo.size > 0) return
    // TODO: add better wandering 
    if (this.wandering) {
      tempVector.set(0, 0, - 1).applyAxisAngle(upVector, this.angle)
      this.mesh.position.addScaledVector(tempVector, this.speed * delta)
      if (Math.random() <= this.wanderStopChance * delta) {
        this.wandering = false
      }
    } else {
      if (Math.random() <= this.wanderChance * delta) {
        // set rotation to random for now
        this.angle = Math.random() * 2 * Math.PI
        this.wandering = true
      }
    }
  }
  checkTargetDistance() {
    if (!this.targetPosition) return 0;
    if (distance(this.targetPosition.x, this.targetPosition.y, this.mesh.position.x, this.mesh.position.y) <= 2) {
      this.targetPosition = null;
    }
  }
  async newChat(start: string, client: Client) {
    const chat = new Chat(this)
    await chat.init(start)
    this.startTalkingTo(client)
    return chat
  }

  startTalkingTo(client: Client) {
    this.talkingTo.add(client.pid)
    // face towards whoever i am talking to
    this.targetPosition = client.player.mesh.position;
  }

  stopTalkingTo(client: Client) {
    this.talkingTo.delete(client.pid)
  }

  addItem(client: Client) {
    const item = new bodyTest()
    client.player.inventory.addItem(item)
  }

  handleCommands(command: string, client: Client) {
    const fn = this.commands.get(command)
    if (fn) fn(client)
  }
}