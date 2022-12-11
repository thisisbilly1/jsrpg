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

export type location = {
  x: number
  y: number
  z: number
}

export interface entity {
  location: location
  camera: camera
  keyInputs: keyInputs
  update(timeElapsed: number): void
}