import { server } from './serverTypes'
import networkContants from '../../networkConstants.json';

export class worldManager {
  server: server;
  tickRate: number;
  tickTimer: number;
  constructor(server: server) {
    this.server = server;
    this.tickRate = 10;
    this.tickTimer = 0;
  }

  update(timeElapsed: number) {
    this.tickTimer += timeElapsed;
    if (this.tickTimer < this.tickRate) return;
    this.tickTimer = 0;

    // this.server.sendAll({
    //   id: networkContants.message,
    //   message: `test tick: ${timeElapsed}`
    // })
    // update all the client's entities
    for (const [_, client] of this.server.clients) {
      client.entity.update(timeElapsed)
      this.server.sendAll({
        id: networkContants.move,
        pid: client.pid,
        ...client.entity.location
      })
    }
  }

  schedule(t1: number) {
    setTimeout(() => {
      const t2 = performance.now();
      this.update((t2 - t1));
      this.schedule(t2);
    });
  }

  run() {
    const t1 = performance.now();
    this.schedule(t1);
  }
}