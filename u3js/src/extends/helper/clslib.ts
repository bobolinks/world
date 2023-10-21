/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Nodes from "three/examples/jsm/nodes/Nodes";
import type { NodePin, NodePins, NodePinsPair, NodeProto, NodeTypeName, PinDirect, PinEnum, ThreeNode, } from "../../types/types";
import { ClsTypeInfo, nodes, three, types } from "../accessors/deco";
import { logger } from './logger';

const clsCached: Record<string, NodePinsPair> = {};

function resort(set: any): any {
  const entries = Object.entries(set);
  entries.forEach(e => delete set[e[0]]);
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  entries.forEach(e => set[e[0]] = e[1]);
  return set;
}

export function isNodeClass(clsName: string): boolean {
  return /Material$/.test(clsName) || !!nodes[clsName as keyof typeof nodes];
}

// ref to GPUNodeTypeName without void
const keysGpuNodeValueTypes = new Set('bool,int,float,vec2,vec3,vec4,mat3,mat4,code,color,uint,int,property,sampler,texture,cubeTexture,ivec2,uvec2,bvec2,ivec3,uvec3,bvec3,ivec4,uvec4,bvec4,imat3,umat3,bmat3,imat4,umat4,bmat4'.split(','));
export function isGPUNodeValueType(type: string): boolean {
  return keysGpuNodeValueTypes.has(type);
}

// ref to CPUNodeValueTypeName with void
const keysCpuNodeValueTypes = new Set('void,Boolean,Number,String,Script,Color,Vector2,Vector3,Vector4,Matrix3,Matrix4,Euler,Audio,Image,Texture,CubeTexture,Material,Object3D,Object'.split(','));
export function isCPUNodeValueType(type: string): boolean {
  return keysCpuNodeValueTypes.has(type.split('[')[0]);
}

export function isNodeValueType(type: string) {
  return isGPUNodeValueType(type) || isCPUNodeValueType(type);
}

export function isTypesCompitableTo(types1: Array<NodeTypeName>, types2: Array<NodeTypeName>) {
  for (const k of types1) {
    if (!types2.includes(k)) {
      return false;
    }
  }
  return true;
}

export function isNodeCompitableTo(node: ThreeNode, name: string) {
  return (node as any)[`is${name}`];
}

export function isClsCompitableTo(from: string, to: string) {
  if (from === to) {
    return true;
  }
  const info = getClsInfo(from);
  if (!info || !info.proto) {
    return false;
  }
  if (Array.isArray(info.proto)) {
    for (const proto of info.proto) {
      if (isClsCompitableTo(proto, to)) {
        return true;
      }
    }
    return false;
  }
  return isClsCompitableTo(info.proto, to);
}

export function isClsCompitableTypes(name: string, types: Array<NodeTypeName>) {
  if (types.includes(name as any)) {
    return true;
  }
  for (const k of types) {
    if (isClsCompitableTo(name, k)) {
      return true;
    }
  }
  return false;
}

export function isClsBaseof(name: string, base: string) {
  if (name === base) {
    return true;
  }
  const info = getClsInfo(name);
  if (!info || !info.proto) {
    return false;
  }
  if (Array.isArray(info.proto)) {
    for (const proto of info.proto) {
      if (isClsBaseof(proto, base)) {
        return true;
      }
    }
    return false;
  }
  return isClsBaseof(info.proto, base);
}

function parseTypes(names: string[]): NodePin<any>['types'] {
  let firstDict: PinEnum | null = null;
  let firstList: PinEnum | null = null;
  const result: NodePin<any>['types'] = [];
  for (const name of names) {
    if (/^".+"$/.test(name)) {
      const type = (/^"(.+)"$/.exec(name) as any)[1];
      if (!firstList) {
        firstList = [type];
        result.push(firstList);
      } else {
        firstList.push(type);
      }
      continue;
    }
    const [, type, suffix] = /^([^[\]]+)(\[\])?$/.exec(name) || [];
    if (type.startsWith('types.')) {
      const values: PinEnum = types[type.substring(6) as keyof typeof types] as any;
      if (!values) {
        // not allowed todo this, so we throw an exception
        throw logger.panic(`type[${type}] not found`);
      }
      if (Array.isArray(values)) {
        if (!firstList) {
          firstList = [...values];
          result.push(firstList);
        } else {
          firstList.push(...values);
        }
      } else {
        if (!firstDict) {
          firstDict = { ...values };
          result.push(firstDict);
        } else {
          Object.assign(firstDict, values);
        }
      }
    } else if (name === 'null') {
      result.push(null);
    } else if (type === 'boolean' || /true|false/i.test(name)) {
      result.push('Boolean' + (suffix || '') as any);
    } else if (type === 'string') {
      result.push('String' + (suffix || '') as any);
    } else if (type === 'number') {
      result.push('Number' + (suffix || '') as any);
    } else if (!isNodeValueType(type) && !isNodeClass(type)) {
      logger.warn(`type[${name}] unsupported!`);
      result.push(name as NodeTypeName);
    } else {
      result.push(name as NodeTypeName);
    }
  }
  return result;
}

function mergeMembers(set: NodePins<any>, members: Record<string, string>, direct: PinDirect): NodePins<any> {
  for (const [key, type] of Object.entries(members)) {
    const types = parseTypes(type.replace(/\s/mg, '').split('|'));
    // eslint-disable-next-line no-sparse-arrays
    const [, name, append] = /^(.+)(Node)$/.exec(key) || [, key];
    const hasNode = (!!append) || types.findIndex(e => typeof e === 'string' && isNodeClass(e)) !== -1;
    const prop: NodePin<any> = set[name] || (set[name] = { types, direct, });
    if (hasNode) {
      prop.nname = key;
      // mergeTypes(prop.types, types);
    }
    replaceTypes(prop.types, types);
  }
  return set;
}

function replaceTypes(t1: NodePin<any>['types'], t2: NodePin<any>['types']) {
  const keysRemove: NodePin<any>['types'] = t1.filter(e => e !== null && !isNodeClass(e as any) && !t2.includes(e));
  for (const t of t2) {
    if (t1.includes(t)) {
      continue;
    }
    t1.push(JSON.parse(JSON.stringify(t)));
  }
  keysRemove.forEach(e => t1.splice(t1.indexOf(e), 1));
}

function mergeTypes(t1: NodePin<any>['types'], t2: NodePin<any>['types']) {
  for (const t of t2) {
    if (t1.includes(t)) {
      continue;
    }
    t1.push(JSON.parse(JSON.stringify(t)));
  }
}

function mergePins(set: NodePins<any>, other: NodePins<any>): NodePins<any> {
  for (const [key, prop] of Object.entries(other)) {
    const value = set[key];
    if (!value) {
      set[key] = JSON.parse(JSON.stringify(prop));
      continue;
    }
    if (value.nname && prop.nname && value.nname !== prop.nname) {
      throw logger.panic('type mismatched!');
    } else {
      if (!value.nname) {
        value.nname = prop.nname;
      }
      mergeTypes(value.types, prop.types);
    }
  }
  return set;
}

export function getPins(clsName: string): NodePinsPair {
  const _getPins = (name: string): NodePinsPair => {
    const cached = clsCached[name];
    if (cached) {
      return cached;
    }

    const pins: NodePinsPair = { in: {}, out: {} };
    const cls = nodes[name as keyof typeof nodes] || three[name as keyof typeof three];
    if (!cls) {
      return pins;
    }

    let proto = (cls as any).proto;
    if (proto) {
      proto = Array.isArray(proto) ? proto : [proto];
      for (const pro of proto) {
        const propsSub = _getPins(pro);
        mergePins(pins.in, propsSub.in);
        mergePins(pins.out, propsSub.out);
      }
    }

    mergeMembers(pins.in, cls.members, 'in');
    if ((cls as any).out) {
      mergeMembers(pins.out, (cls as any).out, 'out');
    }

    resort(pins.in);
    resort(pins.out);

    clsCached[name] = pins;
    return pins;
  }
  return _getPins(clsName);
}

export function getPinsByNode(ins: string): NodePinsPair {
  const proto = getProto(ins);
  if (!proto) {
    // can not be happen, so we throw an exception
    throw logger.panic(`Node constructor[${ins}] not found!`);
  }
  return getPins(proto.clsName);
}

export function getClsName(ins: string) {
  const proto = getProto(ins);
  if (!proto) {
    // can not be happen, so we throw an exception
    throw logger.panic(`Node constructor[${ins}] not found!`);
  }
  return proto.clsName;
}

export function getBaseClsName(clsName: string) {
  const info = getClsInfo(clsName);
  if (!info) return undefined;
  return info.proto;
}

export function getClsInfo(name: string): ClsTypeInfo | undefined {
  return (nodes[name as keyof typeof nodes] || three[name as keyof typeof three]) as any;
}

export function addNodeClass(name: string, cls: typeof Object.constructor, members?: { [key: string]: NodeTypeName }, base?: string, constructors?: Record<string, NodeConstructor>) {
  const info = nodes[name as keyof typeof nodes];
  if (info) {
    // not allowed todo this, so we throw an exception
    throw logger.panic(`class[${name}] exists`);
  }

  (Nodes as any).addNodeClass(name, cls);

  // add constructor
  nodes[name as keyof typeof nodes] = { cls, members: members || {}, proto: base } as any;
  if (constructors) {
    for (const [k, v] of Object.entries(constructors)) {
      addConstructor(k, v);
    }
  }
}

//----------------------------------------
//
type CreateFunc = () => ThreeNode;

export type NodeProtoMore = NodeProto & {
  func: CreateFunc;
  title: string;
  group: string;
  icon: string;
};

export type NodeConstructor = Omit<NodeProtoMore, 'in' | 'out' | 'name' | 'title'>;

type NodeProtoTree = {
  name: string;
  icon: string;
  title?: string;
  children: Array<NodeProtoTree | NodeProtoMore>;
};

export const tree: Array<NodeProtoTree> = [];
export const protos: { [key: string]: NodeProtoMore } = {};

export function addConstructor(name: string, constr: NodeConstructor) {
  if (protos[name]) {
    // not allowed todo this, so we throw an exception
    throw logger.panic(`Node Constructor[${name}] aready exists`);
  }

  const group = constr.group || `Others.${name}`;
  const names = group.split('.');
  let ar: Array<NodeProtoTree> = tree;

  const title = names.pop();
  for (const n of names) {
    let it = ar.find(e => e.name === n);
    if (!it) {
      it = {
        name: n,
        icon: '',
        children: [],
      };
      ar.push(it);
    }
    ar = it.children as Array<NodeProtoTree>;
  }

  const tar = ar.find(e => e.name === name);
  if (tar) {
    // not allowed todo this, so we throw an exception
    throw logger.panic(`Node Constructor[${name}] aready exists`);
  }
  const pins = getPins(constr.clsName);
  const proto: NodeProtoMore = {
    name,
    ...constr,
    title: title || name,
    in: { ...pins.in },
    out: { ...pins.out },
  };
  protos[name] = proto;
  ar.push(proto as any);
}

export function getProto(name: string): NodeProtoMore | undefined {
  return protos[name];
}

export function createThreeNode(name: string, from?: ThreeNode) {
  const proto = protos[name];
  if (!proto) {
    // can not be happen, so we throw an exception
    throw logger.panic(`Node Constructor[${name}] not found`);
  }
  const node = proto.func();

  // copy if exists
  if (from) {
    if ((node as any).copy) {
      (node as any).copy(from);
    } else {
      for (const k of [...Object.keys(proto.in), ...Object.keys(proto.out)]) {
        const v = (from as any)[k];
        const tv = typeof v;
        const vt = (node as any)[k];
        if (tv === 'undefined' || v === null || tv === 'boolean' || tv === 'string' || tv === 'number') {
          (node as any)[k] = v;
        } else if (v.clone) {
          (node as any)[k] = v.clone();
        } else if (vt && vt.copy) {
          vt.copy(v);
        } else {
          (node as any)[k] = v;
        }
      }
    }
  }

  return node;
}

