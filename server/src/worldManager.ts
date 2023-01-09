import { serverType } from './app';
import networkContants from '../../networkConstants.json';
import { OBJLoader } from './helpers/OBJLoader';
import * as BufferGeometryUtils from './helpers/BufferGeometryUtils';
import { MeshBVH, computeBoundsTree } from 'three-mesh-bvh';
import { BufferGeometry, Mesh } from 'three';
import fs from 'fs';
import path from 'path';
import { NPC } from './entities/npc';
import { Client } from './client';

export class WorldManager {
  server: serverType
  tickRate: number
  tickTimer: number
  collider: Mesh | null
  physicsSteps: number
  npcs: NPC[]
  constructor(server: serverType) {
    this.server = server
    this.tickRate = 10
    this.tickTimer = 0
    this.collider = null
    this.physicsSteps = 3
    this.npcs = [
      // test npc
      new NPC(0, this.server)
    ]
  }

  update(timeElapsed: number) {
    this.tickTimer += timeElapsed
    if (this.tickTimer < this.tickRate) return
    this.tickTimer = 0

    // update the npcs
    for (const npc of this.npcs) {
      for (let i = 0; i < this.physicsSteps; i++) {
        npc.update(this, timeElapsed / this.physicsSteps)
      }
      if (npc.shouldUpdateNetwork) {
        this.server.sendAll({
          id: networkContants.npcMove,
          npcId: npc.id,
          x: npc.mesh.position.x,
          y: npc.mesh.position.y,
          z: npc.mesh.position.z
        })
      }
    }

    // update all the clients' entities
    for (const [_, client] of this.server.clients) {
      for (let i = 0; i < this.physicsSteps; i++) {
        client.player.update(this, timeElapsed / this.physicsSteps)
      }
      if (client.player.shouldUpdateNetwork) {
        this.server.sendAll({
          id: networkContants.move,
          pid: client.pid,
          x: client.player.mesh.position.x,
          y: client.player.mesh.position.y,
          z: client.player.mesh.position.z
        })
      }
    }
  }

  // sends all npcs to a client on login
  sendAllNpcs(client: Client) {
    for (const npc of this.npcs) {
      client.send({
        id: networkContants.npcMove,
        npcId: npc.id,
        x: npc.mesh.position.x,
        y: npc.mesh.position.y,
        z: npc.mesh.position.z
      })
    }
  }

  findNpc(id: number) {
    return this.npcs.find((npc)=> npc.id === id)
  }

  schedule(t1: number) {
    setTimeout(() => {
      const t2 = performance.now();
      this.update((t2 - t1));
      this.schedule(t2);
    });
  }

  loadWorld() {
    console.log(__dirname);
    const data = fs.readFileSync(path.resolve(__dirname, '../../world/world.obj'), 'utf8');
    const objLoader = new OBJLoader();
    const group = objLoader.parse(data);
    const geometries: BufferGeometry[] = [];
    group.traverse(child => {
      if ((<Mesh>child).geometry) {
        const cloned = (<Mesh>child).geometry.clone();
        cloned.applyMatrix4(child.matrixWorld);
        for (const key in cloned.attributes) {
          if (key !== 'position') {
            cloned.deleteAttribute(key);
          }
        }
        geometries.push(cloned);
      }
    });
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);
    this.collider = new Mesh(mergedGeometry);
  }
  async run() {
    // load the world
    console.log('loading world...');
    this.loadWorld();
    console.log('starting world');
    const t1 = performance.now();
    this.schedule(t1);
  }
}