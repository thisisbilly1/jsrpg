import { server } from './serverTypes'
import { worldManager } from './entityTypes';
import networkContants from '../../networkConstants.json';
// import { GLTFLoader } from './helpers/GLTFLoader';
// import { DRACOLoader } from './helpers/DRACOLoader';
// require('./helpers/GLTFLoader2');l
import { OBJLoader } from './helpers/OBJLoader';
import * as BufferGeometryUtils from './helpers/BufferGeometryUtils';
import { MeshBVH } from 'three-mesh-bvh';
import { Box3, BufferGeometry, Mesh } from 'three';
import fs from 'fs';
import path from 'path';

export class WorldManager implements worldManager {
  server: server
  tickRate: number
  tickTimer: number
  collider: Mesh | null
  physicsSteps: number
  constructor(server: server) {
    this.server = server
    this.tickRate = 10
    this.tickTimer = 0
    this.collider = null
    this.physicsSteps = 3
  }

  update(timeElapsed: number) {
    this.tickTimer += timeElapsed
    if (this.tickTimer < this.tickRate) return
    this.tickTimer = 0

    // this.server.sendAll({
    //   id: networkContants.message,
    //   message: `test tick: ${timeElapsed}`
    // })
    // update all the client's entities
    for (const [_, client] of this.server.clients) {
      for (let i = 0; i < this.physicsSteps; i++) {
        client.entity.update(this, timeElapsed / this.physicsSteps)
      }
      this.server.sendAll({
        id: networkContants.move,
        pid: client.pid,
        x: client.entity.mesh.position.x,
        y: client.entity.mesh.position.y,
        z: client.entity.mesh.position.z
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