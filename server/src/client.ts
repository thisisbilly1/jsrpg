import { serverType } from './app';
import { inventoryClickOption, inventorySwap, message, messageEquipment, messageInventory, messageMove } from './messageTypes';
import { Player } from './entities/player';
import networkContants from '../../networkConstants.json';

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


interface user {
  username: string
}
export class Client {
  socket: any
  server: serverType
  user: user | null
  entity: Player
  pid: number
  constructor(socket: any, server: serverType) {
    this.socket = socket
    this.server = server
    this.user = null
    this.pid = [...this.server.clients.keys()].length
    this.entity = new Player(this)

    this.setUpSockets()
  }
  setUpSockets() {
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
        // move
        case networkContants.move:
          this.move(message);
          break;
        // inventory
        case networkContants.inventory:
          this.inventory(message);
          break;
        // equipment
        case networkContants.equipment:
          this.equipment(message)
          break
      }
    })
    this.socket.on('close', () => this.server.closeConnection(this));
  }

  @isLoggedIn
  equipment(message: messageEquipment) {
    this.entity.inventory.equipment.unequip(message.slot)
  }

  @isLoggedIn
  inventory(message: messageInventory) {
    const { type } = message
    if (type === 'requestInventory') {
      this.entity.inventory.updateInventory()
    }
    if (type === 'clickOption') {
      this.entity.inventory.clickOption((message as inventoryClickOption).itemIndex, (message as inventoryClickOption).action)
    }
    if (type === 'swap') {
      this.entity.inventory.swapItems((message as inventorySwap).itemIndex1, (message as inventorySwap).itemIndex2)
    }
  }

  @isLoggedIn
  move({ forward, back, left, right, jump, angle }: messageMove) {
    this.entity.keyInputs = {
      forward,
      back,
      left,
      right,
      jump
    }
    this.entity.angle = angle;
    if (jump) {
      if (this.entity.framesOffGround <= 20) this.entity.velocity.y = 10;
    }
  }

  @isLoggedIn
  message({ message }: message) {
    this.server.sendAll({
      id: networkContants.message, message: `${this.user?.username}: ${message}`
    })
  }

  @isLoggedOut
  login({ username, password }: message) {
    const failedLoginMessage = { id: networkContants.login, loggedIn: false };
    if (!this.canLogIn(String(username), String(password))) this.send(failedLoginMessage);
    else {
      // set the user
      this.user = { username } as user;
      // send the login packet
      this.send({ id: networkContants.login, loggedIn: true, pid: this.pid });
      // send login message
      this.sendOthers({
        id: networkContants.joined,
        username,
        pid: this.pid,
      })
      console.log(`${username} has logged in!`)
      // send everyone elses info to me
      for (const [_socket, client] of this.server.clients) {
        if (client.user?.username && client.pid !== this.pid) {
          this.send({
            id: networkContants.joined,
            username: client.user.username,
            pid: client.pid,
          })
        };
      }
      // send all npcs to me
      this.server.sendNpcs(this)
    }
  }

  canLogIn(username: string, password: string) {
    const user = this.server.db.objectForPrimaryKey("User", username);
    if (!(user && user.password === password)) return false;
    // check if they are logged in already
    for (const [_socket, client] of this.server.clients) {
      if (client.user?.username === username) return false;
    }
    return true;
  }

  @isLoggedOut
  register(message: message) {
    const { username, password } = message;
    try {
      this.server.db.write(() => {
        this.server.db.create('User', {
          username,
          password,
        })
      });
      console.log(`${username} has registered!`)
      this.login(message);
    } catch (e) {
      this.send({ id: networkContants.login, loggedIn: false })
    }
  }

  send(message: message) {
    this.socket.send(JSON.stringify(message));
  }

  sendOthers(message: message) {
    this.server.sendAll(message,
      // dont include myself
      [this.pid]);
  }
}