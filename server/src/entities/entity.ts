import { Box3, Line3, Matrix4, Mesh, Vector3 } from 'three';
import { WorldManager } from '../worldManager';

const tempVector = new Vector3();
const tempVector2 = new Vector3();
const tempBox = new Box3();
const tempMat = new Matrix4();
const tempSegment = new Line3();

interface collider {
  radius: number
  segment: Line3
}

export class Entity {
  mesh: Mesh

  grounded: Boolean
  gravity: number
  velocity: Vector3
  angle: number
  collider: collider
  speed: number
  constructor() {
    this.mesh = new Mesh()

    this.grounded = false
    this.gravity = -30

    this.velocity = new Vector3();
    this.collider = {
      radius: 0.5,
      segment: new Line3(new Vector3(), new Vector3(0, -1, 0))
    }
    this.angle = 0
    this.speed = 10

    this.reset()
  }

  reset() {
    this.velocity.set(0, 0, 0)
    this.mesh.position.set(0, 10, 0)
  }

  update(worldManager: WorldManager, delta: number) {
    const deltaSeconds = delta / 1000;
    this.velocity.y += this.grounded ? 0 : deltaSeconds * this.gravity;
    this.mesh.position.addScaledVector(this.velocity, deltaSeconds);

    this.controls(deltaSeconds)
    this.collision(worldManager, deltaSeconds);
  }

  controls(delta: number) {
    // Put the controls here--
    this.mesh.updateMatrixWorld();
  }

  collision(worldManager: WorldManager, delta: number) {
    if (!worldManager.collider || !worldManager.collider.geometry.boundsTree) return;

    // adjust player position based on collisions
    tempBox.makeEmpty();
    tempMat.copy(worldManager.collider.matrixWorld).invert();
    tempSegment.copy(this.collider.segment);

    // get the position of the capsule in the local space of the collider
    tempSegment.start.applyMatrix4(this.mesh.matrixWorld).applyMatrix4(tempMat);
    tempSegment.end.applyMatrix4(this.mesh.matrixWorld).applyMatrix4(tempMat);

    // get the axis aligned bounding box of the capsule
    tempBox.expandByPoint(tempSegment.start);
    tempBox.expandByPoint(tempSegment.end);

    tempBox.min.addScalar(-this.collider.radius);
    tempBox.max.addScalar(this.collider.radius);

    worldManager.collider.geometry.boundsTree.shapecast({
      intersectsBounds: box => box.intersectsBox(tempBox),
      intersectsTriangle: tri => {
        // check if the triangle is intersecting the capsule and adjust the
        // capsule position if it is.
        const triPoint = tempVector;
        const capsulePoint = tempVector2;

        const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
        if (distance < this.collider.radius) {

          const depth = this.collider.radius - distance;
          const direction = capsulePoint.sub(triPoint).normalize();

          tempSegment.start.addScaledVector(direction, depth);
          tempSegment.end.addScaledVector(direction, depth);
        }
      }
    });
    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = tempVector;
    newPosition.copy(tempSegment.start).applyMatrix4(worldManager.collider.matrixWorld);

    // check how much the collider was moved
    const deltaVector = tempVector2;
    deltaVector.subVectors(newPosition, this.mesh.position);

    // if the player was primarily adjusted vertically we assume it's on something we should consider ground
    this.grounded = deltaVector.y > Math.abs(delta * this.velocity.y * 0.25);

    const offset = Math.max(0.0, deltaVector.length() - 1e-5);
    deltaVector.normalize().multiplyScalar(offset);

    // adjust the player model
    this.mesh.position.add(deltaVector);

    if (!this.grounded) {
      deltaVector.normalize();
      this.velocity.addScaledVector(deltaVector, - deltaVector.dot(this.velocity));
    } else this.velocity.set(0, 0, 0);

    if (this.mesh.position.y < -25) {
      this.reset();
    }

  }
}