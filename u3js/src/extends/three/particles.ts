import { BufferGeometry, DynamicDrawUsage, Float32BufferAttribute, Material, Points, Texture, Vector3 } from "three";
import type { Meta } from "../../types/types";
import type { Output } from "../../serializer";
import { addThreeClass } from "./utils";
import worldGlobal from "./worldGlobal";

const _tmpVec3 = new Vector3();
const _tmpVec31 = new Vector3();

export class Particles<
  TMaterial extends Material = Material,
> extends Points<BufferGeometry, TMaterial> {
  public readonly isParticles = true;

  public mass = 0;
  /** Resistance Coefficient */
  public airResCoe = 0.0025;
  public growSpeed = 1;
  public readonly spaceSize = new Vector3(1, 1, 1);
  public readonly bornSpaceSize = new Vector3(1, 1, 1);
  public readonly bornPoint = new Vector3(0, 0, 0);

  private _count = 100;
  private _countFired = 0;
  private _positions: Float32BufferAttribute = null as any;
  private _velocities: Float32BufferAttribute = null as any;
  private _bornTime = 0;

  constructor(geometry?: BufferGeometry, material?: TMaterial) {
    super(geometry || new BufferGeometry, material);

    (this as any).type = 'Particles';

    this.rebuildBuffer();

    this.onBeforeRender = () => {
      this.update();
    };
  }

  get count() {
    return this._count;
  }
  set count(val: number) {
    if (val <= 0) {
      val = 100;
    }
    if (this._count === val) {
      return;
    }
    this._count = val;
    this.rebuildBuffer();
  }

  private rebuildBuffer() {
    this._countFired = 0;
    this.geometry.setDrawRange(0, 0);

    const arPosition = new Float32Array(this._count * 3);
    const arVelocity = new Float32Array(this._count * 3);
    const newPosition = new Float32BufferAttribute(arPosition, 3);
    const newVelocity = new Float32BufferAttribute(arVelocity, 3);

    newPosition.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute('position', newPosition);

    this._positions = newPosition;
    this._velocities = newVelocity;
  }

  private update() {
    for (let i = 0; i < this._countFired; i++) {
      const x = this._positions.getX(i);
      const y = this._positions.getY(i);
      const z = this._positions.getZ(i);
      if (this.isOutofSpace(x, y, z)) {
        this._positions.setXYZ(i, ...this.randBornPoint());
        this._velocities.setXYZ(i, 0, 0, 0);
      } else {
        const [pos, vel] = worldGlobal.calcObjectPosition(
          _tmpVec3.set(x, y, z),
          _tmpVec31.set(this._velocities.getX(i), this._velocities.getY(i), this._velocities.getZ(i)),
          this.mass,
          this.airResCoe,
        )
        this._positions.setXYZ(i, ...pos.toArray());
        this._velocities.setXYZ(i, ...vel.toArray());
      }
    }
    this.grow();
    this._positions.needsUpdate = true;
  }

  private grow() {
    if (this._countFired >= this._count) {
      return;
    }
    const delta = this._bornTime === 0 ? 1 : ((worldGlobal.now - this._bornTime) / 1000);
    if (!this._bornTime) {
      this._bornTime = worldGlobal.now;
    }
    const count = Math.floor(delta * this.growSpeed);
    const growCount = Math.min(count, this._count) - this._countFired;
    if (growCount <= 0) {
      return;
    }
    const offset = this._countFired;

    this._countFired += growCount;

    for (let i = offset; i < this._countFired; i++) {
      this._positions.setXYZ(i, ...this.randBornPoint());
      this._velocities.setXYZ(i, 0, 0, 0);
    }
    this.geometry.setDrawRange(0, this._countFired);
  }

  private isOutofSpace(x: number, y: number, z: number): boolean {
    return x > this.spaceSize.x || x < -this.spaceSize.x ||
      y > this.spaceSize.y || y < -this.spaceSize.y ||
      z > this.spaceSize.z || z < -this.spaceSize.z;
  }

  private randBornPoint(): [number, number, number] {
    _tmpVec3.copy(this.bornPoint);
    _tmpVec3.x += this.bornSpaceSize.x * (Math.random() - 0.5) * 2;
    _tmpVec3.y += this.bornSpaceSize.y * (Math.random() - 0.5) * 2;
    _tmpVec3.z += this.bornSpaceSize.z * (Math.random() - 0.5) * 2;

    if (_tmpVec3.x > this.spaceSize.x) {
      _tmpVec3.x = this.spaceSize.x - 0.00001;
    } else if (_tmpVec3.x < -this.spaceSize.x) {
      _tmpVec3.x = -this.spaceSize.x + 0.00001;
    }

    if (_tmpVec3.y > this.spaceSize.y) {
      _tmpVec3.y = this.spaceSize.y - 0.00001;
    } else if (_tmpVec3.y < -this.spaceSize.y) {
      _tmpVec3.y = -this.spaceSize.y + 0.00001;
    }

    if (_tmpVec3.z > this.spaceSize.z) {
      _tmpVec3.z = this.spaceSize.z - 0.00001;
    } else if (_tmpVec3.z < -this.spaceSize.z) {
      _tmpVec3.z = -this.spaceSize.z + 0.00001;
    }
    return _tmpVec3.toArray();
  }

  toJSON(meta: Meta) {
    const object: any = {};
    const output: Output = {
      metadata: {
        version: 4.6,
        type: 'Object',
        generator: 'Object3D.toJSON'
      },
      object,
    } as any;

    object.uuid = this.uuid;
    object.type = this.type;

    if (this.name !== '') object.name = this.name;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;
    if (this.frustumCulled === false) object.frustumCulled = false;
    if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
    if (Object.keys(this.userData).length > 0) object.userData = this.userData;

    object.layers = this.layers.mask;
    object.matrix = this.matrix.toArray();
    object.up = this.up.toArray();

    if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

    // dont save geometry
    // object.geometry = serialize(meta.geometries, this.geometry);

    if (this.material !== undefined) {
      if (Array.isArray(this.material)) {
        const uuids = [];
        for (let i = 0, l = this.material.length; i < l; i++) {
          uuids.push(serialize(meta.materials, this.material[i]));
        }
        object.material = uuids;
      } else {
        object.material = serialize(meta.materials, this.material);
      }
    }

    if (this.children.length > 0) {
      object.children = [];
      for (const child of this.children) {
        object.children.push(child.toJSON(meta).object);
      }
    }

    return output;

    function serialize(library: { [key: string]: any }, element: BufferGeometry | Material | Texture) {
      if (library[element.uuid] === undefined) {
        library[element.uuid] = element.toJSON(meta);
      }
      return element.uuid;
    }
  }

  protected serialize(json: any) {
    json.mass = this.mass;
    json.spaceSize = this.spaceSize.toArray();
    json.bornSpaceSize = this.bornSpaceSize.toArray();
    json.bornPoint = this.bornPoint.toArray();
    json.count = this.count;
    json.growSpeed = this.growSpeed;
    json.airResCoe = this.airResCoe;
  }

  protected deserialize(json: any) {
    if (json.mass !== undefined) {
      this.mass = json.mass;
    }
    if (json.spaceSize) {
      this.spaceSize.fromArray(json.spaceSize);
    }
    if (json.bornSpaceSize) {
      this.bornSpaceSize.fromArray(json.bornSpaceSize);
    }
    if (json.bornPoint) {
      this.bornPoint.fromArray(json.bornPoint);
    }
    if (json.count > 0) {
      this.count = json.count;
    }
    if (json.growSpeed > 0) {
      this.growSpeed = json.growSpeed;
    }
    if (json.airResCoe !== undefined) {
      this.airResCoe = json.airResCoe;
    }
  }
}

addThreeClass('Particles', {
  members: {
    mass: 'Number',
    airResCoe: 'Number',
    count: 'Number',
    spaceSize: 'Vector3',
    bornPoint: 'Vector3',
    bornSpaceSize: 'Vector3',
    growSpeed: 'Number',
  },
  proto: 'Points',
  group: 'Particles.Particles',
  icon: 'box',
  create: () => new Particles(),
});
