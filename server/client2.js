
function loggedIn() {
  return (target, key, descriptor) => {
    let fn = descriptor.value;
    descriptor.value = (...args) => {
      if (this.user)
        return fn.call(this, ...args);
      else
        console.error('user not logged in, but trying to send data')
    }
    return descriptor;
  };
}
export class client {
  constructor(socket, server) {
    this.socket = socket;
    this.server = server;
    this.user = null;

    this.socket.on('message', str => {
      const message = JSON.parse(str);
      switch (message.id) {
        // login
        case 0:
          this.login(message);
          break;
        // message
        case 1:
          this.message(message);
          break;
      }
    });
    this.socket.on('close', this.server.closeConnection.bind(server));
  }

  message({ message }) {
    this.server.sendAll({
      id: 1, message: `${username}: ${message}`
    });
  }

  login({ username, password }) {
    if (username === 'test' && password === 'test') {
      this.send({ id: 0, loggedIn: true });
      this.server.sendAll({
        id: 1, message: `${username} has logged in!`
      });
    } else this.send({ id: 0, loggedIn: false })
  }
  send(message) {
    this.socket.send(JSON.stringify(message));
  }
}