import { Camera, EventDispatcher, Material, MeshBasicMaterial, Object3D, ShaderMaterial, Texture, WebGLRenderer } from "three";
import { AnyJson, nodeObject, } from "three/examples/jsm/nodes/Nodes";
import { ObjectNode } from "../nodes/object";
import type { GraphEventMap, GraphNode, LinkPoint, Meta, NodeEventMap, NodePin, NodePinsPair, NodeTypeName, ObjectsMap, ObjectsTransfer, PinDirect, ThreeNode, UpdatableNode, UserEventMap } from "../../types/types";
import { ScriptNode } from "../nodes/script";
import { createThreeNode, getClsName, getPins, isClsCompitableTypes, isNodeClass, isTypesCompitableTo } from "../helper/clslib";
import { ScriptBlockNode } from "../nodes/block";
import { nodeProxy } from "../nodes/index";
import { logger } from "../helper/logger";
import { getProxyRawObject } from "../three/utils";

export enum BoundType {
  None = 0,
  Ref = 1,
  Push = 2,
  // for script block chain
  Chain = 3,
}

export class Graph extends EventDispatcher<GraphEventMap & UserEventMap & NodeEventMap> {
  public readonly nodes: Array<GraphNode> = [];

  public isLocked = false;

  constructor(public readonly object: Object3D) {
    super();

    if (!object.graph) {
      object.graph = this;
    }

    this.addEventListener('nodeEventOutputChanged', ({ node, fields }: NodeEventMap['nodeEventOutputChanged']) => {
      for (const field of fields) {
        this.applyNodePins((node as any)._parentGraphNode, field, 'out');
      }
    });
  }

  newGraphNode(node: ThreeNode, name: string) {
    const anchor = new Proxy({ x: 0, y: 0 }, {
      set: (target: any, p: string | symbol, value: any, receiver: any): boolean => {
        if (value === Reflect.get(target, p)) {
          return true;
        }
        const rs = Reflect.set(target, p, value, receiver);
        if (rs) {
          this.dispatchEvent({ type: 'graphModified', soure: this, nodes: [graphNode] });
        }
        return rs;
      },
    });
    const graphNode: GraphNode = {
      name,
      scoped: nodeProxy(node, this),
      anchor,
      bounds: {},
      outs: {},
    };
    // hacks
    (node as any)._parentGraphNode = graphNode;
    return graphNode;
  }

  add(node: GraphNode) {
    const index = this.nodes.indexOf(node);
    if (index !== -1) {
      throw logger.panic(`Graph Node[${node.scoped.uuid}] aready exists`);
    }
    if (node.scoped instanceof ObjectNode) {
      node.scoped.eventDispatcher = this;
    }
    this.nodes.push(node);
    this.dispatchEvent({ type: 'graphAdded', soure: this, nodes: [node] });
  }

  remove(node: GraphNode) {
    const index = this.nodes.indexOf(node);
    if (index === -1) {
      return false;
    }
    this.nodes.splice(index, 1);

    if (node.scoped instanceof ObjectNode) {
      node.scoped.eventDispatcher = null;
    }

    // remove all links of the node
    // remove bounds
    for (const field of Object.keys(node.bounds)) {
      this.disconnect({ node, field }, true);
    }
    // remove outs
    for (const ls of Object.values(node.outs)) {
      for (const bound of [...ls]) {
        this.disconnect({ node: bound.node, field: bound.field }, true);
      }
    }

    if ((node.scoped as any).dispose) {
      (node.scoped as any).dispose();
    }

    this.dispatchEvent({ type: 'graphRemoved', soure: this, nodes: [node] });
  }

  get(uuid: string) {
    return this.nodes.find(e => e.scoped.uuid === uuid);
  }

  update(renderer: WebGLRenderer, camera: Camera, delta: number, now: number) {
    for (const node of this.nodes) {
      if ((node.scoped as any as UpdatableNode).onUpdate) {
        (node.scoped as any as UpdatableNode).onUpdate(renderer, camera, delta, now);
      }
    }
  }

  connect(from: LinkPoint, to: LinkPoint, testOnly?: boolean): BoundType {
    // is script block ?
    if ((!from.field && from.node.scoped instanceof ScriptBlockNode) || (!from.field && to.node.scoped instanceof ScriptBlockNode)) {
      if (from.node.scoped instanceof ScriptBlockNode !== to.node.scoped instanceof ScriptBlockNode) {
        // not allow
        if (testOnly) {
          return BoundType.None;
        }
        // cant be happen, so throw an exception
        throw logger.panic('not supported');
      }
      if (!(from.node.scoped instanceof ScriptBlockNode) || !(to.node.scoped instanceof ScriptBlockNode)) {
        if (testOnly) {
          return BoundType.None;
        }
        // cant be happen, so throw an exception
        throw logger.panic('not supported');
      }
      if (from.node.scoped.next === to.node.scoped) {
        if (testOnly) {
          return BoundType.Chain;
        }
      } else if (from.node.scoped.next || to.node.scoped.prev) {
        if (testOnly) {
          return BoundType.None;
        }
        // cant be happen, so throw an exception
        throw logger.panic('not supported');
      }
      if (testOnly) {
        return BoundType.Chain;
      }
      from.node.scoped.next = to.node.scoped;
      to.node.scoped.prev = from.node.scoped;
      this.dispatchEvent({ type: 'graphModified', soure: this, nodes: [from.node, to.node] });
      this.dispatchEvent({ type: 'graphConnected', soure: this, from: from.node, to: to.node });
      return BoundType.Chain;
    }

    // now for normal fields
    if (!to.field) {
      if (testOnly) {
        return BoundType.None;
      }
      // cant be happen, so throw an exception
      throw logger.panic('not supported');
    }

    const boundSlot = to.node.bounds[to.field];
    if (boundSlot) {
      if (boundSlot.node === from.node && boundSlot.field === from.field) {
        return boundSlot.type;
      }
      if (testOnly) {
        return BoundType.None;
      }
      // cant be happen, so throw an exception
      throw logger.panic(`field[${to.field}] has been bound`);
    }

    const fromName = from.node.scoped instanceof ObjectNode ? from.node.scoped.objectType : getClsName(from.node.name);
    const toName = getClsName(to.node.name);
    const { out: fromPins } = ((from.node.scoped as any).typesExtended as NodePinsPair) || getPins(fromName);
    const { in: toPins } = ((to.node.scoped as any).typesExtended as NodePinsPair) || getPins(toName);
    const fromPin = from.field ? fromPins[from.field] : { types: [fromName] } as NodePin<'out'>;
    const toPin = to.field ? toPins[to.field] : { types: [toName] } as NodePin<'in'>;

    if (from.field) {
      if (!isTypesCompitableTo(fromPin.types as NodeTypeName[], toPin.types as NodeTypeName[])) {
        if (testOnly) {
          return BoundType.None;
        }
        // cant be happen, so throw an exception
        throw logger.panic('type mismatched');
      }
    } else {
      if (!isClsCompitableTypes(fromName, toPin.types as NodeTypeName[])) {
        if (testOnly) {
          return BoundType.None;
        }
        // cant be happen, so throw an exception
        throw logger.panic('type mismatched');
      }
    }

    const fromIsNode = fromPin.types.findIndex((e: any) => isNodeClass(e)) !== -1;
    const boundType = fromIsNode ? BoundType.Ref : BoundType.Push;

    if (testOnly) {
      return boundType;
    }

    to.node.bounds[to.field] = { node: from.node, type: boundType, field: from.field };
    const fromBoundName = from.field || '$';
    const ls = from.node.outs[fromBoundName] || (from.node.outs[fromBoundName] = []);
    ls.push({ node: to.node, type: boundType, field: to.field });

    this.applyNodeBounds(to.node);

    this.dispatchEvent({ type: 'graphModified', soure: this, nodes: [to.node] });
    this.dispatchEvent({ type: 'graphConnected', soure: this, from: from.node, to: to.node });

    return boundType;
  }

  disconnect(point: LinkPoint, silent?: boolean) {
    // is script block ?
    if (!point.field && point.node.scoped instanceof ScriptBlockNode) {
      if (!point.node.scoped.prev) {
        // cant be happen, so throw an exception
        throw logger.panic('state error');
      }
      point.node.scoped.prev.next = undefined;
      point.node.scoped.prev = undefined;
      return;
    }

    // now for normal fields
    if (!point.field) {
      // not allowed to do this, so throw an exception
      throw logger.panic('not allowed');
    }

    const boundInfo = point.node.bounds[point.field];
    if (boundInfo === undefined) {
      return;
    }

    const fromNode = boundInfo.node;
    const fromBoundName = boundInfo.field || '$';
    const ls = fromNode.outs[fromBoundName];

    if (!ls) {
      throw logger.panic(`bound list not found for node[field=${point.field}]`);
    }

    const toScoped = point.node.scoped;
    const index = ls.findIndex(e => e.node === point.node && e.field === point.field);
    if (index === -1) {
      return;
    }

    delete point.node.bounds[point.field];
    ls.splice(index, 1);

    const toValueScoped = (toScoped instanceof ObjectNode) ? toScoped.getObjectsExtended().in : toScoped;

    const value = (toValueScoped as any)[point.field];
    const isMaterial = value instanceof Material;
    if (isMaterial) {
      (toValueScoped as any)[point.field] = new MeshBasicMaterial();
    } else {
      const nodeField = `${point.field}Node`;
      const hasNodeField = Object.hasOwn(toValueScoped, nodeField);
      if (hasNodeField) {
        (toValueScoped as any)[nodeField] = null;
      } else if (value && (value.isNode || value.isMaterial)) {
        (toValueScoped as any)[point.field] = null;
      }
      if (toValueScoped instanceof Material) {
        toValueScoped.needsUpdate = true;
        if (toValueScoped instanceof ShaderMaterial) {
          toValueScoped.uniformsNeedUpdate = true;
        }
      }
    }

    if (!silent) {
      this.dispatchEvent({ type: 'graphModified', soure: this, nodes: [fromNode, point.node] });
      this.dispatchEvent({ type: 'graphDisconnected', soure: this, from: fromNode, to: point.node });
    }
  }

  private clear() {
    for (const node of this.nodes) {
      if ((node.scoped as any).dispose) {
        (node.scoped as any).dispose();
      }
    }
    this.nodes.length = 0;
  }

  clone(root: Object3D, mapper: ObjectsTransfer<Object3D>): Graph {
    const object = mapper.get(this.object);
    if (!object) {
      throw logger.panic(`object[${this.object.uuid}] is not found in list being transfered`);
    }

    const objects: ObjectsMap<Object3D | ThreeNode | Texture> = {};
    // const scopeds: Record<string, ThreeNode> = {};
    // const textures: Record<string, Texture> = {};
    for (const node of this.nodes) {
      const scoped = node.scoped;
      let scopeCloned: ThreeNode;
      const json: any = {};
      if (scoped instanceof ObjectNode) {
        scopeCloned = createThreeNode(node.name);
        scoped.serialize(json);
        (scopeCloned as ObjectNode).deserialize(json);
        if (scoped.object instanceof Texture) {
          // just keep old texture
          objects[scoped.object.uuid] = scoped.object;
        }
        // take out real object in node and add to objects map
        const scopedObject = scoped.object[getProxyRawObject];
        const transferedObject = mapper.get(scopedObject);
        if (transferedObject) {
          objects[scopedObject.uuid] = transferedObject;
        }
      } else if ((scoped as any).clone) {
        scopeCloned = (scoped as any).clone(true) as any;
      } else {
        scopeCloned = createThreeNode(node.name, scoped);
      }
      objects[scopeCloned.uuid] = scopeCloned;
      // yes, old uuid redirect to new one
      objects[scoped.uuid] = scopeCloned;
    }

    const cloned = new Graph(object);
    for (const node of Object.values(this.nodes)) {
      let scopedCloned = objects[node.scoped.uuid] as ThreeNode;
      if (scopedCloned instanceof ObjectNode) {
        scopedCloned.fill(root, objects);
        scopedCloned.eventDispatcher = cloned;
      } else if (!(scopedCloned as any)[getProxyRawObject]) {
        scopedCloned = nodeProxy(nodeObject(scopedCloned as any) as any, cloned);
      }

      const anchor = new Proxy({ ...node.anchor }, {
        set: (target: any, p: string | symbol, value: any, receiver: any): boolean => {
          if (value === Reflect.get(target, p)) {
            return true;
          }
          const rs = Reflect.set(target, p, value, receiver);
          if (rs) {
            cloned.dispatchEvent({ type: 'graphModified', soure: cloned, nodes: [graphNode] });
          }
          return rs;
        },
      });
      const graphNode: GraphNode = {
        name: node.name,
        scoped: scopedCloned,
        anchor,
        bounds: {},
        outs: {},
      };
      // hacks
      (scopedCloned as any)._parentGraphNode = graphNode;
      for (const [field, slot] of Object.entries(node.bounds)) {
        const { node, type, field: peerField } = slot as any;
        const peer = objects[node.scoped.uuid];
        if (!peer) {
          throw logger.panic(`node[${node.scoped.uuid}] not found`);
        }
        // place a fake value(threenode) in boundslot.node
        graphNode.bounds[field] = { type, node: peer as any, field: peerField };
      }
      for (const [field, slots] of Object.entries(node.outs || {})) {
        const ar = graphNode.outs[field] || (graphNode.outs[field] = []);
        for (const slot of slots as Array<any>) {
          const { node, type, field: peerField } = slot as any;
          const peer = objects[node.scoped.uuid as string];
          if (!peer) {
            throw logger.panic(`node[${node.scoped.uuid}] not found`);
          }
          // place a fake value(threenode) in boundslot.node
          ar.push({ node: peer as any, type, field: peerField });
        }
      }
      cloned.nodes.push(graphNode);
    }

    // fix bound.node
    for (const node of cloned.nodes) {
      for (const bound of Object.values(node.bounds)) {
        const peer = cloned.nodes.find(e => e.scoped.uuid === (bound.node as any).uuid);
        if (!peer) {
          console.error(`node[${(bound.node as any).uuid}] not found!`);
        }
        bound.node = peer as any;
      }
      for (const ls of Object.values(node.outs)) {
        for (const bound of ls) {
          const peer = cloned.nodes.find(e => e.scoped.uuid === (bound.node as any).uuid);
          if (!peer) {
            console.error(`node[${(bound.node as any).uuid}] not found!`);
          }
          bound.node = peer as any;
        }
      }
    }

    // now apply bounds
    for (const node of cloned.nodes) {
      cloned.applyNodeBounds(node);
    }

    return cloned;
  }

  serialize(meta: Meta): AnyJson {
    const json: AnyJson = {
      isGraph: true,
      nodes: [],
    };
    for (const node of this.nodes) {
      if (!meta.nodes[node.scoped.uuid]) {
        meta.nodes[node.scoped.uuid] = node.scoped.toJSON(meta);
      }
      const outs: any = {};
      Object.entries(node.outs).forEach(([key, slots]) => {
        outs[key] = slots.map(e => ({ n: e.node.scoped.uuid, f: e.field, t: e.type }));
      });
      const item: any = {
        name: node.name,
        node: node.scoped.uuid,
        anchor: { ...node.anchor },
        bounds: Object.fromEntries(Object.entries(node.bounds).map(e => [e[0], { t: e[1].type, n: e[1].node.scoped.uuid, f: e[1].field }])),
        outs,
      };
      json.nodes.push(item);
    }
    return json;
  }

  deserialize(json: AnyJson, nodes: Record<string, ThreeNode>, textures: Record<string, Texture>) {
    if (!json || !json.isGraph) {
      return;
    }
    if (!Array.isArray(json.nodes)) {
      throw logger.panic('not node info found');
    }
    this.clear();
    const objects: ObjectsMap<ThreeNode | Texture> = { ...nodes, ...textures };
    for (const it of json.nodes) {
      let scoped = nodes[it.node];
      if (!scoped) {
        throw logger.panic(`node[${it.node}] not found`);
      }
      if (scoped instanceof ObjectNode) {
        scoped.fill(this.object, objects);
        scoped.eventDispatcher = this;
      } else {
        scoped = nodeProxy(nodeObject(scoped as any) as any, this);
      }
      const anchor = new Proxy(it.anchor, {
        set: (target: any, p: string | symbol, value: any, receiver: any): boolean => {
          if (value === Reflect.get(target, p)) {
            return true;
          }
          const rs = Reflect.set(target, p, value, receiver);
          if (rs) {
            this.dispatchEvent({ type: 'graphModified', soure: this, nodes: [graphNode] });
          }
          return rs;
        },
      });
      const graphNode: GraphNode = {
        name: it.name,
        scoped,
        anchor,
        bounds: {},
        outs: {},
      };
      // hacks
      (scoped as any)._parentGraphNode = graphNode;
      for (const [field, slot] of Object.entries(it.bounds)) {
        const { n: uuid, t: type, f: peerField } = slot as any;
        const peer = nodes[uuid as string];
        if (!peer) {
          throw logger.panic(`node[${uuid}] not found`);
        }
        // place a fake value(threenode) in boundslot.node
        graphNode.bounds[field] = { type, node: peer as any, field: peerField };
      }
      for (const [field, slots] of Object.entries(it.outs || {})) {
        const ar = graphNode.outs[field] || (graphNode.outs[field] = []);
        for (const slot of slots as Array<any>) {
          const { n: uuid, t: type, f: peerField } = slot as any;
          const peer = nodes[uuid as string];
          if (!peer) {
            throw logger.panic(`node[${uuid}] not found`);
          }
          // place a fake value(threenode) in boundslot.node
          ar.push({ node: peer as any, type, field: peerField });
        }
      }
      this.nodes.push(graphNode);
    }

    // fix bound.node
    for (const node of this.nodes) {
      for (const bound of Object.values(node.bounds)) {
        const peer = this.nodes.find(e => e.scoped.uuid === (bound.node as any).uuid);
        if (!peer) {
          console.error(`node[${(bound.node as any).uuid}] not found!`);
        }
        bound.node = peer as any;
      }
      for (const ls of Object.values(node.outs)) {
        for (const bound of ls) {
          const peer = this.nodes.find(e => e.scoped.uuid === (bound.node as any).uuid);
          if (!peer) {
            console.error(`node[${(bound.node as any).uuid}] not found!`);
          }
          bound.node = peer as any;
        }
      }
    }

    // now apply bounds
    for (const node of this.nodes) {
      this.applyNodeBounds(node);
    }
  }

  private applyNodeBounds(node: GraphNode, fields?: Array<string>) {
    for (const [field, bound] of Object.entries(node.bounds)) {
      if (fields && !fields.includes(field)) {
        continue;
      }
      const { node: from, type, field: fromField } = bound;
      const ls = from.outs[fromField || '$'];

      if (!ls) {
        throw logger.panic(`bound list not found for node[field=${field}]`);
      }

      const fromBound = ls.find(e => e.node === node && e.field === field);
      if (!fromBound) {
        throw logger.panic(`bound slot not found for node[field=${field}]`);
      }

      const fromValueScoped = (from.scoped instanceof ObjectNode) ? from.scoped.getObjectsExtended().out : from.scoped;
      let fromValue = fromField ? (fromValueScoped as any)[fromField] : fromValueScoped;
      const toValueScoped = (node.scoped instanceof ObjectNode) ? node.scoped.getObjectsExtended().in : node.scoped;
      const toValue = (toValueScoped as any)[field];

      if (typeof fromValue === 'object') {
        fromValue = fromValue[getProxyRawObject] || fromValue;
      }

      if (fromValue === toValue) {
        continue;
      }

      if (type === BoundType.Ref) {
        if (typeof toValue === 'object' && toValue.dispose) {
          toValue.dispose();
        }
        (toValueScoped as any)[field] = fromValue;
        continue;
      }

      if (typeof fromValue === 'object') {
        if (!toValue || toValue === null) {
          (toValueScoped as any)[field] = fromValue;
        } else if (typeof toValue.copy === 'function') {
          toValue.copy(fromValue);
        } else if (typeof fromValue.clone === 'function') {
          (toValueScoped as any)[field] = fromValue.clone();
        } else {
          if (typeof toValue === 'object' && toValue.dispose) {
            toValue.dispose();
          }
          (toValueScoped as any)[field] = fromValue;
        }
      } else {
        if (typeof toValue === 'object' && toValue.dispose) {
          toValue.dispose();
        }
        (toValueScoped as any)[field] = fromValue;
      }
    }

    if (node.scoped instanceof Material) {
      node.scoped.needsUpdate = true;
      if (node.scoped instanceof ShaderMaterial) {
        node.scoped.uniformsNeedUpdate = true;
      }
    }
  }

  applyNodePins(node: GraphNode, field: string, io?: PinDirect) {
    if (io === 'in') {
      if (node.scoped instanceof Material) {
        node.scoped.needsUpdate = true;
        if (node.scoped instanceof ShaderMaterial) {
          node.scoped.uniformsNeedUpdate = true;
        }
      } else if (node.scoped instanceof ObjectNode && node.scoped.object instanceof Texture) {
        node.scoped.object.needsUpdate = true;
      }
    } else {
      const bounds = node.outs[field];
      if (!bounds) {
        // no bound info
        return;
      }
      for (const bound of bounds) {
        if (bound.type === BoundType.Ref) {
          this.applyNodePins(bound.node, bound.field, 'in');
        } else {
          this.applyNodeBounds(bound.node, [bound.field]);
        }
      }
    }
  }

  addType(node: GraphNode<ScriptNode>, name: string, type: string, io: PinDirect) {
    if (!name) {
      this.dispatchEvent({ type: 'userEventNotice', source: this, level: 'error', message: 'Empty name!' });
      return false;
    }
    if (!/^[a-z][a-z0-9_]*$/i.test(name)) {
      this.dispatchEvent({ type: 'userEventNotice', source: this, level: 'error', message: 'Illegal name!' });
      return false;
    }
    if (!(node.scoped instanceof ScriptNode)) {
      this.dispatchEvent({ type: 'userEventNotice', source: this, level: 'error', message: 'It is not a ScriptNode!' });
      return false;
    }

    const fn = io === 'in' ? node.scoped.addInput : node.scoped.addOutput;
    if (!fn.call(node.scoped, name, type as any)) {
      this.dispatchEvent({ type: 'userEventNotice', source: this, level: 'error', message: `Failed to create field[${name}] as type[${type}]!` });
      return false;
    }

    return true;
  }

  removeType(node: GraphNode<ScriptNode>, name: string, io: PinDirect) {
    if (!(node.scoped instanceof ScriptNode)) {
      return false;
    }

    const fn = io === 'in' ? node.scoped.removeInput : node.scoped.removeOutput;
    if (!fn.call(node.scoped, name)) {
      return false;
    }

    // remove links
    if (io === 'in') {
      this.disconnect({ node, field: name, io });
    } else {
      const ls = node.outs[name];
      if (ls) {
        for (const bound of [...ls]) {
          this.disconnect({ node: bound.node, field: bound.field });
        }
      }
    }

    return true;
  }
}