import { WebSocketServer } from 'ws';
import { Client } from './client';
import { WorldManager } from './worldManager';
import { server, message, client } from './serverTypes';
import { connect } from './db';
import networkContants from '../../networkConstants.json';

class Server implements server {
  clients: Map<WebSocket, client>
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

  closeConnection(socket: WebSocket, username?: string): void {
    console.log('connection gone');
    this.clients.delete(socket);
    if (username)
      this.sendAll({
        id: networkContants.message, message: `${username} has logged out.`
      });
  }
  sendAll(message: message): void {
    for (const [socket] of this.clients) {
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