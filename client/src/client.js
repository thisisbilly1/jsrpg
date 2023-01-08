import networkConstants from '../../networkConstants.json';
import { playerController } from './game/player/playerController';
import { npcController } from './game/npcController';
export class client {
  constructor(setStatus) {
    this.socket = null;
    this.authenticated = false;
    this.setStatus = setStatus;
    this.pid = null;

    this.playerOthers = {};
    this.playerSelf = new playerController();
    this.npcs = {};

    this.messageHandlers = {
      [networkConstants.login]: (message)=> this.handleLogin(message),
      [networkConstants.joined]: (message)=> this.handlePlayerJoined(message),
      [networkConstants.leave]: (message)=> this.handlePlayerLeave(message),
      [networkConstants.message]: (message)=> {if (this.handleChatMessages) this.handleChatMessages(message)},
      [networkConstants.move]: (message)=> this.handleMove(message),
      [networkConstants.npcMove]: (message)=> this.handleNpcMove(message),
      [networkConstants.inventory]: (message)=> {if (this.handleInventory) this.handleInventory(message)},
      [networkConstants.equipment]: (message)=> this.handleEquipmentMessage(message),
      [networkConstants.npcChat]: (message)=> {if (this.handleNpcChatMessages) this.handleNpcChatMessages(message)},
    }
  }
  connect() {
    this.socket = new WebSocket('ws:localhost:1337');
    this.setStatus('connecting')
    let waitTime = 0;
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (this.socket.readyState === 1) {
          clearInterval(timer);
          this.socket.onmessage = this.handlePackets.bind(this);
          resolve();
        }
        waitTime += 10;
        if (waitTime >= 30000) {
          reject('failed to connect within 30 seconds');
        }
      }, 10);
    });
  }
  async login(username, password) {
    await this.connect();
    this.setStatus('authenticating')
    this.send({
      id: networkConstants.login,
      username,
      password,
    })
  }
  async register(username, password) {
    await this.connect();
    this.setStatus('authenticating')
    this.send({
      id: networkConstants.register,
      username,
      password,
    })
  }
  handlePackets({ data }) {
    const message = JSON.parse(data);
    // console.log(message);
    this.messageHandlers[message.id](message)
  }

  handleEquipmentMessage(message) {
    const pid = message.pid
    // update our equipment if the message is from us
    if (pid === this.playerSelf.pid) {
      if (this.handlEquipment) this.handlEquipment(message)
      this.playerSelf.handlEquipment(message)
    }
    this.playerOthers[pid]?.handlEquipment(message)
  }
  handleNpcMove(message) {
    const npcId = message.npcId;
    // create an npc if one does not exist
    if (!this.npcs[npcId]) this.npcs[npcId] = new npcController(npcId, this);
    this.npcs[npcId].handleMove(message)
  }
  handleMove(message) {
    const pid = message.pid
    if (pid === this.playerSelf.pid) this.playerSelf.handleMove(message)
    else this.playerOthers[pid]?.handleMove(message)
  }
  handlePlayerJoined({ pid, username }) {
    this.playerOthers[pid] = new playerController(pid, username);
    if (this.handleChatMessages) this.handleChatMessages({
      message: `${username} has logged in!`
    })
  }
  handlePlayerLeave({ pid }) {
    if (this.handleChatMessages) this.handleChatMessages({
      message: `${this.playerOthers[pid]?.username} has logged out`
    })
    delete this.playerOthers[pid]
  }
  handleLogin({ loggedIn, pid }) {
    if (loggedIn) {
      this.playerSelf.pid = pid;
      this.setStatus('logged in');
    }
    // failed to log in, close ws connection
    else {
      this.setStatus(null);
      this.socket.close();
    }
  }
  send(message) {
    this.socket.send(JSON.stringify(message));
  }
}