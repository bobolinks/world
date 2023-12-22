/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three';
import { Object3D, MaterialLoader, Color, Vector2, Vector3 } from 'three';
import { three } from "../accessors/deco";
import type { NodeTypeName } from "../../types/types";
import * as NodeMatLib from 'three/examples/jsm/nodes/materials/NodeMaterial';
import { getBaseClsName, isClsBaseof } from '../helper/clslib';
import { logger } from '../helper/logger';

const { createNodeMaterialFromType } = NodeMatLib as any;
const superFromTypeFunction = (MaterialLoader as any).createMaterialFromType;
const materialLib: { [key: string]: typeof Object.constructor } = {};

// hack
(MaterialLoader as any).createMaterialFromType = function (type: string) {
  const material = createNodeMaterialFromType(type);
  if (material) {
    return material;
  }
  if ((materialLib as any)[type]) {
    return new (materialLib as any)[type]();
  }
  return superFromTypeFunction.call(this, type);
}

export function addMaterialClass(name: string, cls: typeof Object.constructor) {
  if (materialLib[name]) {
    throw logger.panic(`Material[${name}] aready exists`);
  }
  materialLib[name] = cls;
}

export type ClsInfo = {
  // cls: typeof Object.constructor;
  create: (...params: any[]) => any;
  members: { [key: string]: NodeTypeName };
  proto?: string;
  group: string;
  icon: string;
};

export const clsExtends: { [key: string]: ClsInfo } = {};

export function createObject<T extends Object3D>(className: string, ...params: any[]): T {
  const info = clsExtends[className as keyof typeof clsExtends];

  if (info) {
    return info.create(...params) as any;
  }
  return new (THREE as any)[className](...params);
}

export function addThreeClass(name: string, info: ClsInfo) {
  if (clsExtends[name]) {
    throw logger.panic(`Class[${name}] aready exists`);
  }
  clsExtends[name] = info;
  if (!(three as any)[name]) {
    (three as any)[name] = info;
  }
  if (isClsBaseof(name, 'Object3D')) {
    if (threeObjects[name]) {
      return;
    }
    threeObjects[name] = (data: any) => info.create(data || {});
  }
}


//------
export const threeObjects: { [key: string]: (data: any) => Object3D } = {
  AmbientLight: (data: any) => new THREE.AmbientLight(data.color, data.intensity),
  Bone: (data: any) => new THREE.Bone(),
  DirectionalLight: (data: any) => new THREE.DirectionalLight(data.color, data.intensity),
  HemisphereLight: (data: any) => new THREE.HemisphereLight(data.color, data.groundColor, data.intensity),
  Group: (data: any) => new THREE.Group(),
  InstancedMesh: (data: any) => {
    const object = new THREE.InstancedMesh(data.geometry, data.material, data.count);
    const instanceMatrix = data.instanceMatrix;
    const instanceColor = data.instanceColor;
    object.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(instanceMatrix.array), 16);
    if (instanceColor !== undefined) object.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(instanceColor.array), instanceColor.itemSize);
    return object;
  },
  LOD: (data: any) => new THREE.LOD(),
  Line: (data: any) => new THREE.Line(data.geometry, data.material),
  LineLoop: (data: any) => new THREE.LineLoop(data.geometry, data.material),
  LineSegments: (data: any) => new THREE.LineSegments(data.geometry, data.material),
  LightProbe: (data: any) => new THREE.LightProbe().fromJSON(data),
  Mesh: (data: any) => new THREE.Mesh(data.geometry, data.material),
  Object3D: (data: any) => new THREE.Object3D(),
  OrthographicCamera: (data: any) => new THREE.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far),
  PerspectiveCamera: (data: any) => new THREE.PerspectiveCamera(data.fov, data.aspect, data.near, data.far),
  PointCloud: (data: any) => new THREE.Points(data.geometry, data.material),
  PointLight: (data: any) => new THREE.PointLight(data.color, data.intensity, data.distance, data.decay),
  Points: (data: any) => new THREE.Points(data.geometry, data.material),
  RectAreaLight: (data: any) => new THREE.RectAreaLight(data.color, data.intensity, data.width, data.height),
  Scene: (data: any) => new THREE.Scene(),
  SpotLight: (data: any) => new THREE.SpotLight(data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay),
  SkinnedMesh: (data: any) => new THREE.SkinnedMesh(data.geometry, data.material),
  Sprite: (data: any) => new THREE.Sprite(data.material),
};

const basicThreeObjectNames = new Set(Object.keys(threeObjects));

export function createObjectFromJson<T extends Object3D>(className: string, json: any): T {
  const func = threeObjects[className as keyof typeof threeObjects];

  if (func) {
    return func(json) as any;
  }

  throw logger.panic(`object class[${className}] not found`);
}

export function isThreeClass(clsName: string) {
  return !!threeObjects[clsName as keyof typeof threeObjects];
}

export function getBaseThreeObjectClass(clsName: string) {
  if (basicThreeObjectNames.has(clsName)) {
    return clsName;
  }
  const base = getBaseClsName(clsName);
  if (!base) {
    return undefined;
  }
  return getBaseThreeObjectClass(base);
}

// others
export function emptyObject(obj: any) {
  Object.keys(obj).forEach(e => delete obj[e]);
}

// proxy
export const getProxyRawObject = Symbol('getProxyRawObject')

export function objectPathAccessible(object: any, cb?: (p: string, value: any) => void) {
  return new Proxy(object, {
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
      if (rv && cb) {
        cb(p, newValue);
      }
      return rv;
    },
  });
}

// for props
export type PropSet = Record<string, boolean | number | string | Color | Vector2 | Vector3 | Array<number> | null>;

export function propsToJson(props: PropSet, json?: any): any {
  if (!json) json = {};
  for (const [k, t] of Object.entries(props)) {
    if (t && typeof t === 'object' && (t as any).toArray) {
      json[k] = (t as any).toArray();
    } else {
      json[k] = props[k];
    }
  }
  return json;
}

// return keys changed
export function propsFromJson(props: PropSet, json: any): string[] {
  const keys: string[] = [];
  for (const [k, ov] of Object.entries(props)) {
    const v = json[k];
    if (v === undefined || v === null || v === ov) {
      continue;
    }
    keys.push(k);
    if (typeof ov === 'object' && (ov as any).fromArray) {
      (ov as any).fromArray(v);
    } else {
      (props as any)[k] = v;
    }
  }
  return keys;
}