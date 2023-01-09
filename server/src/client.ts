import { serverType } from './app';
import { inventoryClickOption, inventorySwap, message, messageEquipment, messageInventory, messageMove, messageNpcChat } from './messageTypes';
import { Player } from './entities/player';
import networkContants from '../../networkConstants.json';
import { Chat } from './entities/chat';
import { User } from './db';
import { Inventory } from './inventory/inventory';

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

interface messageHandler {
  [x: string | number | symbol]: Function
}

export class Client {
  socket: any
  server: serverType
  user: User | null
  player: Player
  pid: number
  messageHandlers: messageHandler
  userData: any
  currentChat: Chat | undefined
  constructor(socket: any, server: serverType) {
    this.socket = socket
    this.server = server
    this.user = null
    this.pid = [...this.server.clients.keys()].length
    this.player = new Player(this)

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
    this.socket.on('close', () => {
      this.currentChat?.npc.stopTalkingTo(this);
      this.server.closeConnection(this)
    });
  }

  @isLoggedIn
  async npcChat(message: messageNpcChat) {
    let npc = this.server.findNpc(message.npcId)
    if (!npc) return

    // Start a new chat with a new npc
    if (this.currentChat == undefined || this.currentChat.npc != npc) {
      let start = this.user?.npcChats[npc.id] || "Start"
      this.currentChat = await npc.newChat(start, this)
    }
    // Continue a chat
    else {
      try {
        this.currentChat.runner.advance(message.choice)
      } catch (err) {
        // Exit chat
        console.log(err)
        this.currentChat = undefined
        return
      }
    }
    let chat = this.currentChat.runner.currentResult
    if (chat?.command) {
      npc.handleCommands(chat.command, this)
      this.currentChat.runner.advance()
      chat = this.currentChat.runner.currentResult
    }

    // Update user for saving
    this.server.db.write(() => {
      if (this.user && chat) {
        this.user.npcChats[npc!.id] = chat.metadata.title
      }
    })

    // Send to client
    this.send({
      id: networkContants.npcChat,
      npcId: this.currentChat.npc.id,
      chat,
    });

    // Stop the npc from chatting to you if the dialogue ends
    if (!chat) {
      this.currentChat.npc.stopTalkingTo(this)
      this.currentChat = undefined
    }
  }

  @isLoggedIn
  equipment(message: messageEquipment) {
    this.player.inventory.equipment.unequip(message.slot)
  }

  @isLoggedIn
  inventory(message: messageInventory) {
    const { type } = message
    if (type === 'requestInventory') {
      this.player.inventory.updateInventory()
    }
    if (type === 'clickOption') {
      this.player.inventory.clickOption((message as inventoryClickOption).itemIndex, (message as inventoryClickOption).action)
    }
    if (type === 'swap') {
      this.player.inventory.swapItems((message as inventorySwap).itemIndex1, (message as inventorySwap).itemIndex2)
    }
  }

  @isLoggedIn
  move({ forward, back, left, right, jump, angle }: messageMove) {
    this.player.keyInputs = {
      forward,
      back,
      left,
      right,
      jump
    }
    this.player.angle = angle;
    if (jump) {
      if (this.player.framesOffGround <= 20) this.player.velocity.y = 10;
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
      this.user = userData
      
      if (!this.user.inventory || this.user.inventory.length == 0) {
        this.player.inventory.items = new Array(Inventory.maxItems)
      }else {
        this.player.inventory.items = this.user.inventory
      }

      // send the login packet
      this.send({ id: networkContants.login, loggedIn: true, pid: this.pid })
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

  private canLogIn(username: string, password: string): User | undefined {
    const user = this.server.db.objectForPrimaryKey("User", username) as User;
    if (!(user && user.password === password)) return undefined;
    // check if they are logged in already
    for (const [_socket, client] of this.server.clients) {
      if (client.user?.username === username) return undefined;
    }
    return user;
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