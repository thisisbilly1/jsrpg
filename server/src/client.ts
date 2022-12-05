
import { server, user, message, client } from './serverTypes'
import networkContants from './networkConstants.json';

function isLoggedIn(target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
  const fn = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if (!(this as any).user) {
      console.warn('user attempted to do something with out being logged in');
    };
    return fn.apply(this, args);
  }
}

function isLoggedOut(target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
  const fn = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if ((this as any).user) {
      console.warn('user is attempting to do something as a logged out user while logged in');
    };
    return fn.apply(this, args);
  }
}

export class Client implements client {
  socket: any;
  server: server;
  user: user | null;
  constructor(socket: any, server: server) {
    this.socket = socket;
    this.server = server;
    this.user = null;

    this.socket.on('message', (str: string) => {
      const message = JSON.parse(str);
      switch (message.id) {
        // login
        case networkContants.login:
          this.login(message);
          break;
        // register
        case networkContants.register:
          this.register(message);
          break;
        // message
        case networkContants.message:
          this.message(message);
          break;
      }
    });
    this.socket.on('close', (socket: any) => this.server.closeConnection(socket, this.user?.username));
  }

  @isLoggedIn
  message({ message }: message) {
    this.server.sendAll({
      id: networkContants.message, message: `${this.user?.username}: ${message}`
    });
  }

  @isLoggedOut
  login({ username, password }: message) {
    const user = this.server.db.objectForPrimaryKey("User", username);
    if (user && user.password === password) {
      // set the user
      this.user = { username } as user;
      // send the login packet
      this.send({ id: networkContants.login, loggedIn: true });
      // send login message
      this.server.sendAll({
        id: networkContants.message, message: `${username} has logged in!`
      });
      console.log(`${username} has logged in!`)
    } else this.send({ id: networkContants.login, loggedIn: false })
  }

  @isLoggedOut
  register(message: message) {
    const { username, password } = message;
    this.server.db.write(() => {
      this.server.db.create('User', {
        username,
        password,
      })
    });
    console.log(`${username} has registered!`)
    this.login(message);
  }

  send(message: message) {
    this.socket.send(JSON.stringify(message));
  }
}