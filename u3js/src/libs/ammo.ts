/* eslint-disable @typescript-eslint/no-namespace */
import * as THREE from 'three';

declare const ammo: typeof Ammo;

type btVector3 = Ammo.btVector3;

export interface PhysicalObject extends THREE.Mesh {
  world?: PhysicalWorld;
  mass: number;
}

export type AmmoBody = Ammo.btRigidBody | Ammo.btSoftBody;

export class PhysicalContext {
  public readonly world: Ammo.btSoftRigidDynamicsWorld;
  public readonly collisionConfiguration: Ammo.btDefaultCollisionConfiguration;
  public readonly dispatcher: Ammo.btCollisionDispatcher;
  public readonly broadphase: Ammo.btDbvtBroadphase;
  public readonly solver: Ammo.btSequentialImpulseConstraintSolver;
  public readonly softBodySolver: Ammo.btDefaultSoftBodySolver;
  public readonly softBodyHelpers: Ammo.btSoftBodyHelpers;
  public readonly worldTransform: Ammo.btTransform;

  private destroyed = false;

  constructor(gravity: number = -9.82) {
    this.collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new ammo.btDbvtBroadphase();
    this.solver = new ammo.btSequentialImpulseConstraintSolver();
    this.softBodySolver = new ammo.btDefaultSoftBodySolver();
    this.softBodyHelpers = new Ammo.btSoftBodyHelpers();
    this.world = new ammo.btSoftRigidDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration, this.softBodySolver);
    this.world.setGravity(new ammo.btVector3(0, gravity, 0));
    this.worldTransform = new ammo.btTransform();
  }

  public dispose() {
    if (!this.destroyed) {
      ammo.destroy(this.collisionConfiguration);
      ammo.destroy(this.dispatcher);
      ammo.destroy(this.broadphase);
      ammo.destroy(this.solver);
      ammo.destroy(this.softBodySolver);
      ammo.destroy(this.softBodyHelpers);
      ammo.destroy(this.world);
      ammo.destroy(this.worldTransform);
      this.destroyed = true;
    }
  }
}

export const physicalWorldContex = new PhysicalContext();

const _tmpMatrix = new THREE.Matrix4();
let _tmpAmmoVectorA: Ammo.btVector3;
let _tmpAmmoVectorB: Ammo.btVector3;
let _tmpAmmoVectorC: Ammo.btVector3;

// adds all verticies (including child verticies) to the triangle mesh
function addMeshVerts(btTriangleMesh: Ammo.btTriangleMesh, topLevelObject: THREE.Mesh, object: THREE.Mesh) {
  if (!object || !object.geometry) {
    return 0;
  }
  if (!_tmpAmmoVectorA) {
    _tmpAmmoVectorA = new Ammo.btVector3();
    _tmpAmmoVectorB = new Ammo.btVector3();
    _tmpAmmoVectorC = new Ammo.btVector3();
  }

  const geometry = object.geometry;
  const vertexPositions = geometry.attributes.position?.array || [];
  const indices = geometry.index?.array || [];
  let triangleCount = 0;

  let localMatrix: THREE.Matrix4;

  if (topLevelObject && topLevelObject !== object) {
    // top level matrix used for shape transform doesn't take scale into account.
    // Moreover, every children vertex position must be in that space.
    // So, each vertex position here is transform by (mesh world matrix * toplevelMatrix -1)
    let topLevelQuaternion: THREE.Quaternion;
    if (topLevelObject.quaternion) {
      topLevelQuaternion = topLevelObject.quaternion;
    } else if (topLevelObject.rotation) {
      topLevelQuaternion = new THREE.Quaternion().setFromEuler(topLevelObject.rotation);
    } else {
      topLevelQuaternion = new THREE.Quaternion().identity();
    }
    const topLevelMatrix = new THREE.Matrix4().compose(new THREE.Vector3(1, 1, 1), topLevelQuaternion, topLevelObject.position);
    _tmpMatrix.copy(topLevelMatrix.invert());
    object.updateWorldMatrix(false, false);
    const wm = object.matrixWorld.clone();
    localMatrix = wm.multiply(_tmpMatrix);
  } else {
    // current top level is same as object level -> only use local scaling
    _tmpMatrix.makeScale(object.scale.x, object.scale.y, object.scale.z);
    localMatrix = _tmpMatrix;
  }
  const faceCount = indices.length / 3;
  for (let i = 0; i < faceCount; i++) {
    const triPoints = [];
    for (let point = 0; point < 3; point++) {
      let v = new THREE.Vector3(vertexPositions[(indices[(i * 3) + point] * 3) + 0], vertexPositions[(indices[(i * 3) + point] * 3) + 1], vertexPositions[(indices[(i * 3) + point] * 3) + 2]);

      v = v.applyMatrix4(localMatrix);

      let vec: any;
      if (point == 0) {
        vec = _tmpAmmoVectorA;
      } else if (point == 1) {
        vec = _tmpAmmoVectorB;
      } else {
        vec = _tmpAmmoVectorC;
      }
      vec.setValue(v.x, v.y, v.z);

      triPoints.push(vec);
    }
    btTriangleMesh.addTriangle(triPoints[0], triPoints[1], triPoints[2]);
    triangleCount++;
  }

  object.children.forEach((m) => {
    triangleCount += addMeshVerts(btTriangleMesh, topLevelObject, m as any);
  });

  return triangleCount;
}

export namespace AmmoUtils {
  export function t2aVector3(v: THREE.Vector3) {
    return new ammo.btVector3(v.x, v.y, v.z);
  }
  export function a2tVector3(v: btVector3) {
    return new THREE.Vector3(v.x(), v.y(), v.z());
  }
  export function createShape(object: THREE.Mesh) {
    const geometry: THREE.BufferGeometry = object.geometry;
    // type EntityGeometry = BoxGeometry | CapsuleGeometry | ConeGeometry | CylinderGeometry |
    // SphereGeometry | TorusGeometry | TorusKnotGeometry;
    if (!geometry) {
      const mesh = new ammo.btTriangleMesh(true, true);
      const triangeCount = addMeshVerts(mesh, object, object);
      const shape = triangeCount ? new Ammo.btBvhTriangleMeshShape(mesh, true) : new Ammo.btCompoundShape();
      shape.setMargin(0.01);
      return shape;
    } else if (geometry.type === 'PlaneGeometry') {
      const geo: THREE.PlaneGeometry = geometry as THREE.PlaneGeometry;
      const parameters = geo.parameters;

      const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
      const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;

      const shape = new ammo.btBoxShape(new ammo.btVector3(sx, sy, 0));
      shape.setMargin(0.01);

      return shape;

    } else if (geometry.type === 'BoxGeometry') {
      const geo: THREE.BoxGeometry = geometry as THREE.BoxGeometry;
      const parameters = geo.parameters;

      const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
      const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
      const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

      const shape = new ammo.btBoxShape(new ammo.btVector3(sx, sy, sz));
      shape.setMargin(0.001);

      return shape;

    } else if (geometry.type === 'CylinderGeometry') {
      const geo: THREE.CylinderGeometry = geometry as THREE.CylinderGeometry;
      const parameters = geo.parameters;

      const shape = new ammo.btCylinderShape(new ammo.btVector3(parameters.radiusBottom, parameters.height, parameters.radiusTop));
      shape.setMargin(0.01);

      return shape;

    } else if (geometry.type === 'ConeGeometry') {
      const geo: THREE.ConeGeometry = geometry as THREE.ConeGeometry;
      const parameters = geo.parameters;

      const shape = new ammo.btConeShape(parameters.radius, parameters.height);
      shape.setMargin(0.01);

      return shape;

    } else if (geometry.type === 'CapsuleGeometry') {
      const geo: THREE.CapsuleGeometry = geometry as THREE.CapsuleGeometry;
      const parameters = geo.parameters;

      const radius = parameters.radius !== undefined ? parameters.radius : 1;
      const length = parameters.length !== undefined ? parameters.length : 1;

      const shape = new ammo.btCapsuleShape(radius, length);
      shape.setMargin(0.01);

      return shape;
    } else if (geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry') {
      const geo: THREE.SphereGeometry | THREE.IcosahedronGeometry = geometry as THREE.SphereGeometry | THREE.IcosahedronGeometry;
      const parameters = geo.parameters;

      const radius = parameters.radius !== undefined ? parameters.radius : 1;

      const shape = new ammo.btSphereShape(radius);
      shape.setMargin(0.001);

      return shape;
    } else {
      const mesh = new ammo.btTriangleMesh(true, true);
      /* */
      const vertices = geometry.attributes.position?.array || [];
      const indices = geometry.index?.array || [];
      for (let i = 0; i * 3 < indices.length; i += 1) {
        mesh.addTriangle(
          new ammo.btVector3(
            vertices[indices[i * 3] * 3],
            vertices[indices[i * 3] * 3 + 1],
            vertices[indices[i * 3] * 3 + 2]
          ),
          new ammo.btVector3(
            vertices[indices[i * 3 + 1] * 3],
            vertices[indices[i * 3 + 1] * 3 + 1],
            vertices[indices[i * 3 + 1] * 3 + 2]
          ),
          new ammo.btVector3(
            vertices[indices[i * 3 + 2] * 3],
            vertices[indices[i * 3 + 2] * 3 + 1],
            vertices[indices[i * 3 + 2] * 3 + 2]
          ),
          false
        );
      }
      const shape = new ammo.btConvexTriangleMeshShape(mesh, true);
      shape.setMargin(0.001);
      /* * /
      const triangeCount = addMeshVerts(mesh, object, object);
      const shape = triangeCount ? new Ammo.btBvhTriangleMeshShape(mesh, true) : new Ammo.btCompoundShape();
      /* */
      return shape;
    }
  }
  export function createRigidBody(mesh: PhysicalObject, mass: number = 0, preShape?: Ammo.btCollisionShape): AmmoBody | Array<AmmoBody> {
    const shape = preShape || createShape(mesh);

    function handleMesh(mesh: PhysicalObject, mass: number, shape: any) {
      const position = mesh.position;
      const quaternion = mesh.quaternion;

      const transform = new ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new ammo.btVector3(position.x, position.y, position.z));
      transform.setRotation(new ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

      const motionState = new ammo.btDefaultMotionState(transform);

      const localInertia = new ammo.btVector3(0, 0, 0);
      shape.calculateLocalInertia(mass, localInertia);

      const rbInfo = new ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);

      const body = new ammo.btRigidBody(rbInfo);

      return body;
    }

    function handleInstancedMesh(mesh: THREE.InstancedMesh, mass: number, shape: any): Array<any> {
      const array = mesh.instanceMatrix.array;
      const bodies = [];

      for (let i = 0; i < mesh.count; i++) {
        const index = i * 16;
        const transform = new ammo.btTransform();
        transform.setFromOpenGLMatrix(arrayLikeSlice(array, index, index + 16));

        const motionState = new ammo.btDefaultMotionState(transform);

        const localInertia = new ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);

        const body = new ammo.btRigidBody(rbInfo);

        bodies.push(body);
      }

      return bodies;
    }

    if ((mesh as any as THREE.InstancedMesh).isInstancedMesh) {
      return handleInstancedMesh(mesh as any as THREE.InstancedMesh, mass, shape);
    } else if (mesh.isMesh) {
      return handleMesh(mesh, mass, shape);
    }
    return handleMesh(mesh, mass, shape);
  }
  export function createRope(start: THREE.Vector3, end: THREE.Vector3, mass: number, segments: number = 10, margin: number = 0.001) {
    const softBodyHelpers = new Ammo.btSoftBodyHelpers();
    const ropeStart = new Ammo.btVector3(start.x, start.y, start.z);
    const ropeEnd = new Ammo.btVector3(end.x, end.y, end.z);
    const ropeSoftBody = softBodyHelpers.CreateRope(physicalWorldContex.world.getWorldInfo(), ropeStart, ropeEnd, segments - 1, 0);
    const sbConfig = ropeSoftBody.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);
    ropeSoftBody.setTotalMass(mass, false);
    Ammo.castObject(ropeSoftBody, Ammo.btCollisionObject).getCollisionShape().setMargin(margin * 3);
  }
  export function destroyBody(body: AmmoBody) {
    ammo.destroy(body);
  }
}

export class PhysicalWorld {
  private destroyed = false;
  private meshes: Array<PhysicalObject> = [];
  private meshMap = new WeakMap<PhysicalObject, AmmoBody | Array<AmmoBody>>();
  private meshIdx = {} as Record<number, PhysicalObject>;
  private conllisionMap = new Set<string>();

  constructor(gravity: number = -9.82) {
    this.setGravity(gravity);
  }

  public dispose() {
    if (!this.destroyed) {
      for (const k of this.meshes) {
        const body = this.meshMap.get(k);
        this.meshMap.delete(k);
        ammo.destroy(body);
      }
      this.meshes.length = 0;
      this.destroyed = true;
    }
  }

  setGravity(gravity: number = -9.82) {
    physicalWorldContex.world.setGravity(new ammo.btVector3(0, gravity, 0));
  }

  addMesh(mesh: PhysicalObject, body: AmmoBody | Array<AmmoBody>) {
    if (body) {
      if (Array.isArray(body)) {
        for (const b of body) {
          if (b instanceof Ammo.btSoftBody) {
            physicalWorldContex.world.addSoftBody(b, 1, -1);
          } else {
            physicalWorldContex.world.addRigidBody(b);
          }
        }
      } else {
        // body.setFriction( 4 );
        if (body instanceof Ammo.btSoftBody) {
          physicalWorldContex.world.addSoftBody(body, 1, -1);
        } else {
          physicalWorldContex.world.addRigidBody(body);
        }
      }

      this.meshes.push(mesh);

      this.meshMap.set(mesh, body);
      if (mesh.id) {
        this.meshIdx[mesh.id] = mesh;
      }
    }

    mesh.world = this;
  }

  removeMesh(mesh: PhysicalObject) {
    const body = this.meshMap.get(mesh);
    const index = this.meshes.indexOf(mesh);
    if (!body) {
      mesh.world = undefined;
      return;
    }
    if (index !== -1) {
      this.meshes.splice(index, 1);
    }
    this.meshMap.delete(mesh);
    delete this.meshIdx[mesh.id];
    if (Array.isArray(body)) {
      for (const b of body) {
        if (b instanceof Ammo.btSoftBody) {
          physicalWorldContex.world.removeSoftBody(b);
        } else {
          physicalWorldContex.world.addRigidBody(b);
        }
      }
    } else {
      if (body instanceof Ammo.btSoftBody) {
        physicalWorldContex.world.removeSoftBody(body);
      } else {
        physicalWorldContex.world.addRigidBody(body);
      }
    }
    mesh.world = undefined;
  }

  findBody(mesh: PhysicalObject) {
    return this.meshMap.get(mesh);
  }

  setMeshPosition(mesh: PhysicalObject, position: THREE.Vector3, index = 0) {
    if ((mesh as any as THREE.InstancedMesh).isInstancedMesh) {
      const bodies = this.meshMap.get(mesh) as Array<AmmoBody>;
      if (!bodies) {
        return;
      }
      const body = bodies[index];

      physicalWorldContex.worldTransform.setIdentity();
      physicalWorldContex.worldTransform.setOrigin(new ammo.btVector3(position.x, position.y, position.z));
      body.setWorldTransform(physicalWorldContex.worldTransform);

    } else if (mesh.isMesh) {
      const body = this.meshMap.get(mesh) as AmmoBody;
      if (!body) {
        return;
      }

      physicalWorldContex.worldTransform.setIdentity();
      physicalWorldContex.worldTransform.setOrigin(new ammo.btVector3(position.x, position.y, position.z));
      body.setWorldTransform(physicalWorldContex.worldTransform);
    }
  }

  detectCollision() {
    const numManifolds = physicalWorldContex.dispatcher.getNumManifolds();
    const curConllisionMap = new Set<string>();

    for (let i = 0; i < numManifolds; i++) {
      const contactManifold = physicalWorldContex.dispatcher.getManifoldByIndexInternal(i);

      const id0 = contactManifold.getBody0().getUserIndex();
      const id1 = contactManifold.getBody1().getUserIndex();

      curConllisionMap.add(`${id0}:${id1}`);
    }

    for (const key of curConllisionMap) {
      if (this.conllisionMap.has(key)) {
        continue;
      }
      this.conllisionMap.add(key);
      const [id0, id1] = key.split(':').map(e => Number.parseInt(e));
      const m1 = this.meshIdx[id0];
      const m2 = this.meshIdx[id1];
      if (m1 && m2) {
        m1.dispatchEvent({ type: 'onCollisionEnter', target: m2 } as any);
        m2.dispatchEvent({ type: 'onCollisionEnter', target: m1 } as any);
      }
    }
    const keysLeave: string[] = [];
    for (const key of this.conllisionMap) {
      if (curConllisionMap.has(key)) {
        continue;
      }
      keysLeave.push(key);
    }
    for (const key of keysLeave) {
      this.conllisionMap.delete(key);
      const [id0, id1] = key.split(':').map(e => Number.parseInt(e));
      const m1 = this.meshIdx[id0];
      const m2 = this.meshIdx[id1];
      if (m1 && m2) {
        m1.dispatchEvent({ type: 'onCollisionLeave', target: m2 } as any);
        m2.dispatchEvent({ type: 'onCollisionLeave', target: m1 } as any);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  step(delta: number, now: number) {
    if (!delta) {
      return;
    }
    physicalWorldContex.world.stepSimulation(delta, 10);

    this.detectCollision();

    //
    for (let i = 0, l = this.meshes.length; i < l; i++) {
      const mesh = this.meshes[i];
      if (!mesh.mass) {
        continue;
      }

      if ((mesh as any as THREE.InstancedMesh).isInstancedMesh) {

        const array = (mesh as any as THREE.InstancedMesh).instanceMatrix.array as any as Array<number>;
        const bodies = this.meshMap.get(mesh) as Array<AmmoBody>;

        for (let j = 0; j < bodies.length; j++) {
          const body = bodies[j];

          if (!(body instanceof Ammo.btRigidBody)) {
            continue;
          }

          const motionState = body.getMotionState();
          motionState.getWorldTransform(physicalWorldContex.worldTransform);

          const position = physicalWorldContex.worldTransform.getOrigin();
          const quaternion = physicalWorldContex.worldTransform.getRotation();

          compose(position, quaternion, array, j * 16);
        }

        (mesh as any as THREE.InstancedMesh).instanceMatrix.needsUpdate = true;
        (mesh as any as THREE.InstancedMesh).computeBoundingSphere();

      } else if (mesh.isMesh) {
        const body = this.meshMap.get(mesh) as AmmoBody;

        if (!(body instanceof Ammo.btRigidBody)) {
          continue;
        }

        const motionState = body.getMotionState();
        motionState.getWorldTransform(physicalWorldContex.worldTransform);

        const position = physicalWorldContex.worldTransform.getOrigin();
        const quaternion = physicalWorldContex.worldTransform.getRotation();
        mesh.position.set(position.x(), position.y(), position.z());
        mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
      }
    }
  }
}

function arrayLikeSlice(arr: ArrayLike<number>, index: number, count: number): Array<number> {
  const ar: Array<number> = [];
  const last = index + count;
  for (let i = index; i < last; i++) {
    ar.push(arr[i]);
  }
  return ar;
}

function compose(position: any, quaternion: any, array: Array<number>, index: number) {
  const x = quaternion.x(), y = quaternion.y(), z = quaternion.z(), w = quaternion.w();
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  array[index + 0] = (1 - (yy + zz));
  array[index + 1] = (xy + wz);
  array[index + 2] = (xz - wy);
  array[index + 3] = 0;

  array[index + 4] = (xy - wz);
  array[index + 5] = (1 - (xx + zz));
  array[index + 6] = (yz + wx);
  array[index + 7] = 0;

  array[index + 8] = (xz + wy);
  array[index + 9] = (yz - wx);
  array[index + 10] = (1 - (xx + yy));
  array[index + 11] = 0;

  array[index + 12] = position.x();
  array[index + 13] = position.y();
  array[index + 14] = position.z();
  array[index + 15] = 1;
}

