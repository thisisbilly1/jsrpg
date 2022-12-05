import { WebSocketServer } from 'ws';
import { client } from './client';

class server {
  constructor(port) {
    this.clients = new Map();
    this.server = new WebSocketServer({ port });

    this.server.on('listening', () => {
      console.log(`server listening on port ${port}`);
    });

    this.server.on('connection', socket => {
      console.log('new connection!');
      const c = new client(socket, this);
      this.clients.set(socket, c);
    });
  }
  closeConnection(socket) {
    console.log('connection gone');
    this.clients.delete(socket);
  }
  sendAll(message) {
    [...this.clients.keys()].forEach(client => {
      client.send(JSON.stringify(message));
    });
  }
}

new server(1337);