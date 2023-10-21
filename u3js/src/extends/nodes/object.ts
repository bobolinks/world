/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three';
import { EventDispatcher, Object3D, Texture } from "three";
import * as Nodes from "three/examples/jsm/nodes/Nodes";
import type { DelayFill, Meta, NodeEventMap, NodePinsPair, Object3DEventMap, ObjectsMap, PinValueType, ThreeNode } from "../../types/types";
import { addNodeClass, getPins, isClsBaseof, isNodeCompitableTo } from "../helper/clslib";
import type { Output } from "../../serializer";
import { emptyObject, getProxyRawObject } from '../three/utils';
import { logger } from '../helper/logger';

type EventMap = NodeEventMap & Object3DEventMap;

export class ObjectNode<T extends Object3D | Texture = Object3D, VT extends PinValueType = PinValueType> extends Nodes.Node implements DelayFill {
  public readonly isObjectNode = true;
  public readonly typesExtended: NodePinsPair<VT> = { in: {}, out: {} };
  public readonly isObject3DNode;

  public eventDispatcher: EventDispatcher<EventMap> | null = null;

  protected _object: T = null as any;
  protected _objectRaw: T = null as any;

  constructor(private readonly _inst: string, public readonly objectType: string, object?: T) {
    super('void');

    if (object) {
      this.object = object;
    }

    this.updateType = 'none';

    this.isObject3DNode = isClsBaseof(objectType, 'Object3D');

    this.initTypes();
  }

  get object() {
    return this._object;
  }

  set object(o: T) {
    if (typeof o !== 'object' || !isNodeCompitableTo(o as any, this.objectType)) {
      throw logger.panic(`type is not compitable, expected type is ${this.objectType}!`);
    }
    this._objectRaw = o;
    this._object = new Proxy(o, {
      get(target, p, receiver) {
        if (p === getProxyRawObject) {
          return target;
        }
        if (typeof p !== 'string') {
          return Reflect.get(target, p, receiver);
        }
        const names = p.split('.');
        if (names.length > 1) {
          let o: any = Reflect.get(target, names[0], receiver);
          for (let i = 1; i < names.length; i++) {
            o = o[names[i]];
          }
          return o;
        }
        return Reflect.get(target, p, receiver);
      },
      set: (target, p, newValue, receiver) => {
        if (typeof p !== 'string') {
          return Reflect.set(target, p, newValue, receiver);
        }
        const ov = Reflect.get(target, p, receiver);
        if (ov === newValue) {
          return true;
        }
        let rv = true;
        const names = p.split('.');
        if (names.length > 1) {
          let o: any = Reflect.get(target, names[0], receiver);
          const lastName = names.pop() as string;
          for (let i = 1; i < names.length; i++) {
            o = o[names[i]];
          }
          if (o[lastName] === newValue) {
            return true;
          }
          o[lastName] = newValue;
        } else {
          rv = Reflect.set(target, p, newValue, target);
        }
        if (this.eventDispatcher) {
          const isInput = !!this.typesExtended.in[p];
          this.eventDispatcher.dispatchEvent({ type: isInput ? 'nodeEventInputChanged' : 'nodeEventOutputChanged', source: null as any, node: this, fields: [p] })
        }
        return rv;
      },
    });
    if (o instanceof Object3D || o instanceof THREE.Material) {
      (this as any).objectType = o.type;
      this.initTypes();
    }
    Object.defineProperty(this, '_object', {
      writable: false,
    });
  }

  getObjectsExtended<T1 extends ThreeNode | Object3D, T2 extends ThreeNode | Object3D>(): { in: T1; out: T2; } {
    return { in: this.object as any, out: this.object as any };
  }

  fill(root: Object3D, objects: ObjectsMap): void {
    if (this._object && typeof this._object === 'string') {
      this.object = (objects[this._object] || root.getObjectByProperty('uuid', this._object)) as any;
    }
  }

  dispose() {
    if (this._object && this._object instanceof Texture) {
      this._object.dispose();
    }
  }

  toJSON(meta: Meta): Nodes.AnyJson {
    const json: Output = super.toJSON(meta);
    if (this._object instanceof Texture) {
      const texture = this._object.toJSON(meta);
      meta.textures[this._object.uuid] = texture;
    }
    return json;
  }

  serialize(json: any): void {
    if (!this._object) {
      throw logger.panic(`object has not been set before serialize!`);
    }
    super.serialize(json);
    json._inst = this._inst;
    json.object = this._object.uuid;
    json.objectType = this.objectType;
  }

  deserialize(json: any): void {
    if (!isClsBaseof(json.objectType, this.objectType)) {
      throw logger.panic(`type is not compitable, expected type is ${this.objectType}!`);
    }
    super.deserialize(json);
    this._object = json.object as any;
    this.initTypes();
  }

  createDefault(currentObject: Object3D) {
    if (this.isObject3DNode) {
      this.object = currentObject as any;
      (this as any).objectType = currentObject.type;
      this.initTypes();
    } else {
      const cls = THREE[this.objectType as keyof typeof THREE];
      if (!cls) {
        throw logger.panic(`class[${this.objectType}] not found in THREE!`);
      }
      this.object = new (cls as any)();
    }
  }

  protected initTypes() {
    const proto = getPins(this.objectType);
    if (!proto) {
      throw logger.panic(`class[${this.objectType}] not found!`);
    }
    emptyObject(this.typesExtended.in);
    Object.assign(this.typesExtended.in, proto.in);
    emptyObject(this.typesExtended.out);
    Object.assign(this.typesExtended.out, proto.out);
  }
}

addNodeClass('ObjectNode', ObjectNode,
  {
    // @ts-expect-error
    object: 'Object3D | Texture',
  }, '',
  {
    object3DRef: { clsName: 'ObjectNode', func: () => new ObjectNode('object3DRef', 'Object3D'), group: 'Objects.Object', icon: 'box' },
    texture: { clsName: 'ObjectNode', func: () => new ObjectNode('texture', 'Texture'), group: 'Inputs.Primitives.Texture', icon: 'photo' },
    // cubeTexture: { clsName: 'CubeTexture', func: () => new ObjectNode('cubeTexture', 'CubeTexture'), group: 'Inputs.Primitives.Cube Texture', icon: 'photo' },
  }
);
