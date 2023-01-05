import { Vector3 } from 'three';
import { Entity } from './entity'
import { Inventory } from '../inventory/inventory';
import { Client } from '../client';

export type keyInputs = {
  forward: Boolean
  back: Boolean
  left: Boolean
  right: Boolean
  jump: Boolean
}

const upVector = new Vector3(0, 1, 0);
const tempVector = new Vector3();

export class Player extends Entity {
  keyInputs: keyInputs
  inventory: Inventory
  client: Client
  constructor(client: Client) {
    super();
    this.keyInputs = {
      forward: false,
      back: false,
      left: false,
      right: false,
      jump: false,
    };
    this.client = client
    this.inventory = new Inventory(this)
  }

  controls(delta: number) {
    if (this.keyInputs.forward) {
      tempVector.set(0, 0, - 1).applyAxisAngle(upVector, this.angle);
      this.mesh.position.addScaledVector(tempVector, this.speed * delta);
    }

    if (this.keyInputs.back) {
      tempVector.set(0, 0, 1).applyAxisAngle(upVector, this.angle);
      this.mesh.position.addScaledVector(tempVector, this.speed * delta);
    }

    if (this.keyInputs.left) {
      tempVector.set(-1, 0, 0).applyAxisAngle(upVector, this.angle);
      this.mesh.position.addScaledVector(tempVector, this.speed * delta);
    }

    if (this.keyInputs.right) {
      tempVector.set(1, 0, 0).applyAxisAngle(upVector, this.angle);
      this.mesh.position.addScaledVector(tempVector, this.speed * delta);
    }

    this.mesh.updateMatrixWorld();
  }
}