export interface message {
  id: Number;
  [x: string | number | symbol]: unknown;
}

export interface client {
  socket: any;
  server: server;
  user: user | null;
  send(message: message): void;
}

export interface server {
  closeConnection(socket: any, username?: string): void;
  sendAll(message: message): void;
  db: any;
}

export interface user {
  username: string;
}