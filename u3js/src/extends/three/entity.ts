import {
  BoxGeometry, BufferGeometry, Euler, Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial, Object3DEventMap,
  Quaternion,
  Vector3,
} from "three";
import { AmmoBody, AmmoUtils, PhysicalObject, PhysicalWorld } from "../../libs/ammo";
import { addThreeClass, getProxyRawObject, objectPathAccessible } from "./utils";
import { types } from "../accessors/deco";

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export enum BodyType {
  Ghost = 0,
  RigidBody = 1,
  // SoftBody = 2,
}

(types as any).BodyType = {
  Ghost: 0,
  RigidBody: 1,
  // SoftBody: 2,
};

const Epsilon = 0.001;

//-------------Entity base---------------
export class Entity<
  TGeometry extends BufferGeometry = BoxGeometry,
  TMaterial extends Material | Material[] = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
  TGeoParams extends Record<string, any> = Record<string, any>,
> extends Mesh<TGeometry, TMaterial, TEventMap> implements PhysicalObject {
  public readonly isEntity = true;

  public readonly geo: Writable<TGeoParams>;
  public readonly geoMatrix = new Matrix4().identity();

  public readonly physicalBody: AmmoBody = null as any;
  public world?: PhysicalWorld;

  private _tmpAmmoVectorA = new Ammo.btVector3(0, 0, 0);
  private _tmpAmmoQuaternion = new Ammo.btQuaternion(0, 0, 0, 1);

  constructor(geometry?: TGeometry, material?: TMaterial, protected _bodyType = BodyType.Ghost, protected _mass = 0) {
    super(geometry || new BoxGeometry() as any, material || new MeshBasicMaterial({ wireframe: true }) as any);

    (this as any).type = 'Entity';

    if (!geometry) {
      this.rebuildBody();
    }

    this.geo = objectPathAccessible(Object.assign({}, this.parameters) as Writable<TGeoParams>, () => {
      this.rebuildGeometry();
    });
  }

  get mass() {
    return this._mass;
  }
  set mass(val: number) {
    if (this._mass === val) {
      return;
    }
    if (this._mass === 0 || val === 0) {
      this._mass = val;
      this.rebuildBody();
    } else {
      this.physicalBody.setMassProps(val);
    }
  }

  get bodyType() {
    return this._bodyType;
  }
  set bodyType(val: BodyType) {
    if (this._bodyType === val) {
      return;
    }
    this._bodyType = val;
    this.rebuildBody();
  }

  protected get parameters(): TGeoParams {
    return (this.geometry as any).parameters || {};
  }

  moveTo(newPosition: Vector3) {
    if (this.physicalBody) {
      this.setPhysicsBodyTransformation(newPosition);
    }
    this.position.copy(newPosition);
  }

  applyTranslation(position: Vector3) {
    return this.applyGeoMatrix4(new Matrix4().makeTranslation(position));
  }

  applyRotationFromEuler(euler: Euler) {
    return this.applyGeoMatrix4(new Matrix4().makeRotationFromEuler(euler));
  }

  applyScale(scale: Vector3) {
    return this.applyGeoMatrix4(new Matrix4().makeScale(scale.x, scale.y, scale.z));
  }

  applyGeoMatrix4(matrix: Matrix4) {
    this.geoMatrix.premultiply(matrix);
    this.geometry.applyMatrix4(matrix);
  }

  clone(recursive?: boolean | undefined): this {
    const cloned = super.clone(recursive);

    const mass = this._mass || 0;
    const bodyType = this._bodyType || BodyType.Ghost;

    if (mass !== this._mass || bodyType !== this._bodyType) {
      cloned._mass = mass;
      cloned._bodyType = bodyType;
      cloned.rebuildBody();
    }

    const geo = (cloned.geo as any)[getProxyRawObject];
    Object.assign(geo, this.parameters);
    cloned.geoMatrix.copy(this.geoMatrix);

    return cloned;
  }

  serialize(json: any) {
    json.mass = this._mass;
    json.bodyType = this._bodyType;
    // json.geo = (this.geo as any)[getProxyRawObject];
    json.geoMatrix = this.geoMatrix.toArray();
  }

  deserialize(json: any) {
    const mass = json.mass || 0;
    const bodyType = json.bodyType || BodyType.Ghost;

    if (mass !== this._mass || bodyType !== this._bodyType) {
      this._mass = mass;
      this._bodyType = bodyType;
      this.rebuildBody();
    }
    // fill geo info
    const geo = (this.geo as any)[getProxyRawObject];
    Object.assign(geo, this.parameters);
    // if (json.geo) Object.assign(this.geo, json.geo);

    if (json.geoMatrix) {
      this.geoMatrix.fromArray(json.geoMatrix);
      this.geometry.applyMatrix4(this.geoMatrix);
      this.geometry.computeBoundingBox();
    }

    this.setPhysicsBodyTransformation(this.position);
  }

  dispose() {
    if (this.material instanceof Material) {
      this.material.dispose();
    } else if (Array.isArray(this.material)) {
      for (const m of this.material) {
        (m as any).material.dispose();
      }
    }
    if (this.physicalBody) {
      if (this.world) this.world.removeMesh(this);
      AmmoUtils.destroyBody(this.physicalBody);
      (this as any).physicalBody = null as any;
    }
  }

  protected rebuildGeometry() {
    const cls = this.geometry.constructor;
    this.geometry.dispose();
    this.geometry = (cls as any).fromJSON((this.geo as any)[getProxyRawObject]);
    this.geometry.applyMatrix4(this.geoMatrix);
    this.geometry.computeBoundingBox();
  }

  protected rebuildBody() {
    const world = this.world;

    // remove old body first
    if (this.physicalBody) {
      if (this.world) {
        this.world.removeMesh(this);
      }
      AmmoUtils.destroyBody(this.physicalBody);
    }

    // create body
    if (this._bodyType !== BodyType.Ghost) {
      (this as any).physicalBody = AmmoUtils.createBody(this, this._mass) as any;
      this.physicalBody.setUserIndex(this.id);
      if (world) {
        world.addMesh(this, this.physicalBody);
      }
    } else {
      (this as any).physicalBody = null as any;
    }
  }

  /**
   * Sets the babylon object's position/rotation from the physics body's position/rotation
   * @param impostor imposter containing the physics body and babylon object
   * @param newPosition new position
   * @param newRotation new rotation
   */
  private setPhysicsBodyTransformation(newPosition: Vector3, newRotation?: Quaternion) {
    if (!this.physicalBody) {
      return;
    }

    const trans = this.physicalBody.getWorldTransform();

    // If rotation/position has changed update and activate rigged body
    if (
      Math.abs(trans.getOrigin().x() - newPosition.x) > Epsilon ||
      Math.abs(trans.getOrigin().y() - newPosition.y) > Epsilon ||
      Math.abs(trans.getOrigin().z() - newPosition.z) > Epsilon ||
      (newRotation &&
        (Math.abs(trans.getRotation().x() - newRotation.x) > Epsilon ||
          Math.abs(trans.getRotation().y() - newRotation.y) > Epsilon ||
          Math.abs(trans.getRotation().z() - newRotation.z) > Epsilon ||
          Math.abs(trans.getRotation().w() - newRotation.w) > Epsilon
        )
      )
    ) {
      this._tmpAmmoVectorA.setValue(newPosition.x, newPosition.y, newPosition.z);
      trans.setOrigin(this._tmpAmmoVectorA);

      if (newRotation) {
        this._tmpAmmoQuaternion.setValue(newRotation.x, newRotation.y, newRotation.z, newRotation.w);
        trans.setRotation(this._tmpAmmoQuaternion);
      }
      this.physicalBody.setWorldTransform(trans);

      if (this.mass == 0) {
        // Kinematic objects must be updated using motion state
        const motionState = this.physicalBody.getMotionState();
        if (motionState) {
          motionState.setWorldTransform(trans);
        }
      } else {
        this.physicalBody.activate();
      }
    }
  }
}

addThreeClass('Entity', {
  create: ({ material, geometry }: any = {}) => new Entity(geometry, material),
  members: {
    mass: 'Number',
    bodyType: 'types.BodyType' as any,
  },
  proto: 'Mesh',
  group: '',
  icon: '',
});
