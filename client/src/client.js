import networkConstants from '../../networkConstants.json';

export class client {
  constructor(setStatus) {
    this.socket = null;
    this.authenticated = false;
    this.setStatus = setStatus;
    this.handleChatMessages = null;
    this.pid = null;

    this.movementHandlers = {};
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
    switch (message.id) {
      // login
      case networkConstants.login:
        this.handleLogin(message);
        break;
      case networkConstants.message:
        if (this.handleChatMessages) this.handleChatMessages(message)
        break;
      case networkConstants.move:
        const pid = message.pid;
        // console.log(this.movementHandlers)
        if (this.movementHandlers[pid]) this.movementHandlers[pid](message);
        break;
    }
  }
  handleLogin({ loggedIn, pid }) {
    if (loggedIn) {
      this.pid = pid;
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