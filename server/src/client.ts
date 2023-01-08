import { serverType } from './app';
import { inventoryClickOption, inventorySwap, message, messageEquipment, messageInventory, messageMove, messageNpcChat } from './messageTypes';
import { Player } from './entities/player';
import networkContants from '../../networkConstants.json';
import { NPC } from './entities/npc';
import { Chat } from './entities/chat';

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
  npcChats: {[x: number]: string}
}

interface messageHandler {
  [x: string | number | symbol]: Function
}

export class Client {
  socket: any
  server: serverType
  user: user | null
  entity: Player
  pid: number
  messageHandlers: messageHandler
  userData: any
  currentChat: Chat | undefined

  constructor(socket: any, server: serverType) {
    this.socket = socket
    this.server = server
    this.user = null
    this.pid = [...this.server.clients.keys()].length
    this.entity = new Player(this)

    this.messageHandlers = {
      [networkContants.login]: (msg: message) => this.login(msg),
      [networkContants.register]: (msg: message) => this.register(msg),
      [networkContants.message]: (msg: message) => this.message(msg),
      [networkContants.move]: (msg: messageMove) => this.move(msg),
      [networkContants.inventory]: (msg: messageInventory) => this.inventory(msg),
      [networkContants.equipment]: (msg: messageEquipment) => this.equipment(msg),
      [networkContants.npcChat]: (msg: messageNpcChat) => this.npcChat(msg),
    }

    this.setUpSockets()
  }
  setUpSockets() {
    this.socket.on('message', (str: string) => {
      const message = JSON.parse(str);
      this.messageHandlers[message.id](message)
    })
    this.socket.on('close', () => this.server.closeConnection(this));
  }

  @isLoggedIn
  async npcChat(message: messageNpcChat) {
    let npc = this.server.findNpc(message.npcId)
    if (!npc) return

    // Start a new chat with a new npc
    if (this.currentChat==undefined || this.currentChat.npc!=npc) {
      let start = this.user?.npcChats[npc.id] || "Start"
      this.currentChat = await npc.newChat(start)
    }
    // Continue a chat
    else{
      try {
        this.currentChat.runner.advance(message.choice)
      } catch(err) {
        // Exit chat
        console.log(err)
        this.currentChat = undefined
        return
      }
    }

    this.send({
      id: networkContants.npcChat,
      npcId: npc.id,
      chat: this.currentChat.runner.currentResult
      });
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
    const userData = this.canLogIn(String(username), String(password));
    if (!userData) this.send(failedLoginMessage);
    else {
      // set the user
      this.user = userData;
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

  private canLogIn(username: string, password: string): user | undefined {
    const user = this.server.db.objectForPrimaryKey("User", username);
    if (!(user && user.password === password)) return undefined;
    // check if they are logged in already
    for (const [_socket, client] of this.server.clients) {
      if (client.user?.username === username) return undefined;
    }
    return user as user;
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