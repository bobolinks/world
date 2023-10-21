// import * as Nodes from "three/examples/jsm/nodes/Nodes";
import * as THREE from 'three';
import { EventDispatcher, } from 'three';
import type { NodeEventMap, Object3DEventMap, ThreeNode } from '../../types/types';
import './object';
import './script';
import './block';
import './event';
import './update';
import './keyboard';
import { ObjectNode, } from './object';
import { NodeConstructor, addConstructor } from '../helper/clslib';
import { getProxyRawObject } from '../three/utils';

const factors: { [key: string]: NodeConstructor } = {
  lineBasicMaterial: { clsName: 'LineBasicMaterial', func: () => new THREE.LineBasicMaterial(), group: 'Material.Line Basic Material', icon: 'brand-medium' },
  // lineBasicNodeMaterial: { clsName: 'LineBasicNodeMaterial', func: () => new Nodes.LineBasicNodeMaterial(), group: 'Material.Line Basic Material Node', icon: 'brand-medium' },
  meshBasicMaterial: { clsName: 'MeshBasicMaterial', func: () => new THREE.MeshBasicMaterial(), group: 'Material.Mesh Basic Material', icon: 'brand-medium' },
  // meshBasicNodeMaterial: { clsName: 'MeshBasicNodeMaterial', func: () => new Nodes.MeshBasicNodeMaterial(), group: 'Material.Mesh Basic Material Node', icon: 'brand-medium' },
  meshPhysicalMaterial: { clsName: 'MeshPhysicalMaterial', func: () => new THREE.MeshPhysicalMaterial({}), group: 'Material.Mesh Physical Material', icon: 'brand-medium' },
  // meshPhysicalNodeMaterial: { clsName: 'MeshPhysicalNodeMaterial', func: () => new Nodes.MeshPhysicalNodeMaterial({}), group: 'Material.Mesh Physical Material Node', icon: 'brand-medium' },
  meshStandardMaterial: { clsName: 'MeshStandardMaterial', func: () => new THREE.MeshStandardMaterial(), group: 'Material.Mesh Standard Material', icon: 'brand-medium' },
  // meshStandardNodeMaterial: { clsName: 'MeshStandardNodeMaterial', func: () => new Nodes.MeshStandardNodeMaterial(), group: 'Material.Mesh Standard Material Node', icon: 'brand-medium' },
  pointsMaterial: { clsName: 'PointsMaterial', func: () => new THREE.PointsMaterial(), group: 'Material.Points Material', icon: 'brand-medium' },
  // pointsNodeMaterial: { clsName: 'PointsNodeMaterial', func: () => new Nodes.PointsNodeMaterial(), group: 'Material.Points Material Node', icon: 'brand-medium' },
  spriteMaterial: { clsName: 'SpriteMaterial', func: () => new THREE.SpriteMaterial(), group: 'Material.Sprite Material', icon: 'brand-medium' },
  // spriteNodeMaterial: { clsName: 'SpriteNodeMaterial', func: () => new Nodes.SpriteNodeMaterial(), group: 'Material.Sprite Material Node', icon: 'brand-medium' },
  pongMaterial: { clsName: 'MeshPhongMaterial', func: () => new THREE.MeshPhongMaterial(), group: 'Material.Phong Material', icon: 'brand-medium' },
  toonMaterial: { clsName: 'MeshToonMaterial', func: () => new THREE.MeshToonMaterial({ color: 0xffffff, refractionRatio: 0.98 } as any), group: 'Material.Toon Material', icon: 'brand-medium' },
  normalMaterial: { clsName: 'MeshNormalMaterial', func: () => new THREE.MeshNormalMaterial(), group: 'Material.Normal Material', icon: 'brand-medium' },
  matcapMaterial: { clsName: 'MeshMatcapMaterial', func: () => new THREE.MeshMatcapMaterial(), group: 'Material.Matcap Material', icon: 'brand-medium' },
  lambertMaterial: { clsName: 'MeshLambertMaterial', func: () => new THREE.MeshLambertMaterial(), group: 'Material.Lambert Material', icon: 'brand-medium' },
  depthMaterial: { clsName: 'MeshDepthMaterial', func: () => new THREE.MeshDepthMaterial(), group: 'Material.Depth Material', icon: 'brand-medium' },
};

for (const [k, f] of Object.entries(factors)) {
  addConstructor(k, f);
}

// Usually, node property is renamed with xxxNode, 
// but we only keep first part xxx as field name, 
// so we must redirect property's name to real node name automatically

export function nodeProxy(node: ThreeNode, eventDispatcher: EventDispatcher<NodeEventMap & Object3DEventMap>) {
  if (node instanceof ObjectNode) {
    return node;
  }
  return new Proxy(node, {
    get(target, p, receiver) {
      if (p === getProxyRawObject) {
        return target;
      }
      if (typeof p !== 'string') {
        return Reflect.get(target, p, receiver);
      }
      if (Reflect.has(target, `${p}Node`)) {
        const v = Reflect.get(target, `${p}Node`, receiver);
        if (v !== null) {
          return v;
        }
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
      let realName = p;
      if (Reflect.has(target, `${p}Node`) && (newValue && newValue.isNode)) {
        realName = `${p}Node`;
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
        const ov = Reflect.get(target, realName, receiver);
        if (ov === newValue) {
          return true;
        }
        rv = Reflect.set(target, realName, newValue, receiver);
      }
      if (rv) {
        // only ObjectNode has outputs
        eventDispatcher.dispatchEvent({ type: 'nodeEventInputChanged', source: null as any, node, fields: [p] })
      }
      return rv;
    },
  });
}