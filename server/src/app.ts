import { WebSocketServer } from 'ws';
import { Client } from './client';
import { WorldManager } from './worldManager';
import { message } from './messageTypes';
import { connect } from './db';
import networkContants from '../../networkConstants.json';


export interface serverType {
  closeConnection(socket: any, username?: string): void
  sendAll(message: message, nonIncludedPids?: number[]): void
  db: any
  clients: Map<WebSocket, Client>
}

class Server implements serverType {
  clients: Map<WebSocket, Client>
  server: any;
  db: any;
  port: number;
  constructor(port: number, db: any) {
    this.db = db;
    this.port = port;
    this.clients = new Map();
    this.server = null;
  }

  start() {
    this.server = new WebSocketServer({ port: this.port });
    this.server.on('listening', () => {
      console.log(`server listening on port ${this.port}`);
    });
    this.server.on('connection', (socket: any) => {
      console.log('new connection!');
      const c = new Client(socket, this);
      this.clients.set(socket, c);
    });
  }

  closeConnection(client: Client): void {
    console.log('connection gone');
    this.clients.delete(client.socket);
    if (client?.user) {
      this.sendAll({ id: networkContants.leave, pid: client.pid });
      console.log(`${client.user.username} has logged out`);
    }
  }
  sendAll(message: message, nonIncludedPids?: number[]): void {
    for (const [socket, client] of this.clients) {
      if (!nonIncludedPids?.includes(client.pid))
        socket.send(JSON.stringify(message));
    }
  }
}

async function start(): Promise<void> {
  const db = await connect();
  const server = new Server(1337, db);
  const wm = new WorldManager(server);
  wm.run();
  server.start();
}

start();