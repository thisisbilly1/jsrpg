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