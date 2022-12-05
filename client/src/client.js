import networkConstants from '../utils/networkConstants.json';

export class client {
  constructor(setStatus) {
    this.socket = null;
    this.authenticated = false;
    this.setStatus = setStatus;
    this.handleChatMessages = null;
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
    console.log(message);
    switch (message.id) {
      // login
      case networkConstants.login:
        this.handleLogin(message);
        break;
      case networkConstants.message:
        this.handleChatMessages(message)
        break;
    }
  }
  handleLogin({ loggedIn }) {
    if (loggedIn) this.setStatus('logged in');
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