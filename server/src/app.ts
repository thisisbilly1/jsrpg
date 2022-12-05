import { WebSocketServer } from 'ws';
import { Client } from './client';
import { server, message } from './serverTypes';
import { connect } from './db';
import networkContants from './networkConstants.json';

class Server implements server {
  clients: Map<any, any>;
  server: any;
  db: any;
  constructor(port: number, db: any) {
    this.clients = new Map();
    this.server = new WebSocketServer({ port });
    this.db = db;

    this.server.on('listening', () => {
      console.log(`server listening on port ${port}`);
    });

    this.server.on('connection', (socket: any) => {
      console.log('new connection!');
      const c = new Client(socket, this);
      this.clients.set(socket, c);
    });
  }
  closeConnection(socket: any, username?: string) {
    console.log('connection gone');
    this.clients.delete(socket);
    if (username)
      this.sendAll({
        id: networkContants.message, message: `${username} has logged out.`
      });
  }
  sendAll(message: message) {
    [...this.clients.keys()].forEach(client => {
      client.send(JSON.stringify(message));
    });
  }
}

async function start() {
  const db = await connect();
  new Server(1337, db);
}

start();