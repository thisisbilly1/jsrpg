import { entity } from './entityTypes'
export interface message {
  id: Number
  [x: string | number | symbol]: unknown
}
export interface client {
  socket: any
  server: server
  user: user | null
  send(message: message): void
  entity: entity
  pid: number
}

export interface server {
  closeConnection(socket: any, username?: string): void
  sendAll(message: message): void
  db: any
  clients: Map<WebSocket, client>
}

export interface user {
  username: string
}