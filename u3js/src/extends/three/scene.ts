/* eslint-disable @typescript-eslint/no-unused-vars */
import { BufferGeometry, Camera, Material, Object3D, Object3DEventMap, Scene, Vector3, WebGLRenderer } from "three";
import { addThreeClass } from "./utils";
import { PhysicalWorld } from "../../libs/ammo";
import { Entity } from "./entity";
import worldGlobal from "./worldGlobal";

export class PhysicalScene extends Scene {
  public readonly isPhysicalScene = true;
  public readonly physics: PhysicalWorld;
  public readonly windForce: Vector3 = new Vector3();

  /** to y axis */
  protected _gravity: number = -9.8;

  private objectsTrash: Record<number, Object3D> = {};

  constructor() {
    super();

    (this as any).type = 'PhysicalScene';

    this.physics = new PhysicalWorld(this._gravity);
  }

  get gravity() {
    return this._gravity;
  }
  set gravity(val: number) {
    if (this._gravity === val) {
      return;
    }
    this._gravity = val;
    this.physics.world.setGravity(new Ammo.btVector3(0, this._gravity, 0));
  }

  update(renderer: WebGLRenderer, camera: Camera, delta: number, now: number, globalOnly = false) {
    worldGlobal.scene = this;
    worldGlobal.gravity.y = this._gravity;
    const force = this.windForce.clone().multiplyScalar(0.5 + 0.5 * Math.sin(now / 2000))
    worldGlobal.windForce.copy(force);

    if (!globalOnly) {
      for (const child of this.children) {
        if (child.visible && child.graph) {
          child.graph.update(renderer, camera, delta, now);
        }
      }
      this.physics.step(delta, now);
    }
  }

  add(...object: Object3D<Object3DEventMap>[]): this {
    super.add(...object);

    for (const o of object) {
      delete this.objectsTrash[o.id];
      if (o instanceof Entity) {
        this.physics.addMesh(o, o.physicalBody);
        // this.physics.setMeshPosition(o, this.position);
      }
      o.dispatchEvent({ type: 'onBorn', source: this, object: o } as any);
    }
    return this;
  }

  remove(...object: Object3D<Object3DEventMap>[]): this {
    super.remove(...object);

    for (const o of object) {
      if (o instanceof Entity) {
        this.physics.removeMesh(o);
      }
      o.dispatchEvent({ type: 'onDead', source: this, object: o } as any);
      this.objectsTrash[o.id] = o;
    }
    return this;
  }

  serialize(json: any) {
    json.gravity = this.gravity;
    json.windForce = this.windForce.toArray();
  }

  deserialize(json: any) {
    if (json.gravity) {
      this.gravity = json.gravity;
    }
    if (json.windForce) {
      this.windForce.fromArray(json.windForce);
    }
  }

  active() {
    this.dispatchEvent({ type: 'onBorn', source: this, object: this } as any);
    for (const child of this.children) {
      if (child.dispatchEvent) {
        child.dispatchEvent({ type: 'onBorn', source: this, object: child } as any);
      }
    }
  }

  deactive() {
    for (const child of this.children) {
      if (child.dispatchEvent) {
        child.dispatchEvent({ type: 'onDead', source: this, object: child } as any);
      }
    }
    this.dispatchEvent({ type: 'onDead', source: this, object: this } as any);
  }

  dispose() {
    for (const object of Object.values(this.objectsTrash)) {
      object.traverse(child => {
        if ((child as any).dispose) {
          (child as any).dispose();
        } else {
          if ((child as any).geometry instanceof BufferGeometry) {
            (child as any).geometry.dispose();
          }
          if ((child as any).material instanceof Material) {
            (child as any).material.dispose();
          } else if (Array.isArray((child as any).material)) {
            for (const m of (child as any).material) {
              m.dispose();
            }
          }
        }
      });
    }
    this.physics.dispose();
  }
}

addThreeClass('PhysicalScene', {
  // cls: PhysicalScene,
  members: {
    gravity: 'Number',
    windForce: 'Vector3',
  },
  proto: 'Scene',
  group: 'Scenes.Physical Scene',
  icon: 'scene',
  create: () => new PhysicalScene(),
});
