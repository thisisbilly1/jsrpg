import { Vector3 } from 'three';
import { Entity } from './entity'

const upVector = new Vector3(0, 1, 0);
const tempVector = new Vector3();

export class PlayerEntity extends Entity {
  constructor() {
    super();
  }

  controls(delta: number) {
    this.mesh.updateMatrixWorld();
  }
}