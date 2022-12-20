import { server } from './serverTypes';

export type camera = {
  x: number
  y: number
  z: number
}
export type keyInputs = {
  forward: Boolean
  back: Boolean
  left: Boolean
  right: Boolean
  jump: Boolean
}

import { Line3, Vector3, Mesh } from 'three';
export interface worldManager {
  server: server;
  tickRate: number;
  tickTimer: number;
  collider: Mesh | null;
}

export interface collider {
  radius: number
  segment: Line3
}
export interface entity {
  mesh: Mesh
  keyInputs: keyInputs
  update(worldManager: worldManager, timeElapsed: number): void
  angle: number
  collider: collider
}