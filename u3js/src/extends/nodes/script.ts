import { Color, Object3D, Vector2, Vector3, Vector4, Euler } from "three";
import * as THREE from 'three';
import * as Nodes from "three/examples/jsm/nodes/Nodes";
import type { ThreeNode } from "../../types/types";
import { addNodeClass } from "../helper/clslib";
import { emptyObject } from "../three/utils";
import { createVarValueFromType, toJsonByType } from "../helper/value";
import { ObjectNode } from "./object";
import worldGlobal from "../three/worldGlobal";

export type PinTypeSupported = 'Boolean' | 'Number' | 'String' | 'Url' | 'Color' | 'Vector2' | 'Vector3' | 'Vector4' | 'Euler' | 'bool' | 'float' | 'color' | 'vec2' | 'vec3' | 'vec4';
type PinValueSupported = boolean | number | string | Color | Vector2 | Vector3 | Vector4 | Euler | Nodes.UniformNode;
type ValueSet = Record<string, PinValueSupported>;

export const AsyncFunction: any = (globalThis as any).AsyncFunction || (async (x: any) => x).constructor;

export class ScriptNode<T extends Object3D = Object3D> extends ObjectNode<T, PinTypeSupported> {
  public readonly isScriptNode = true;
  public readonly inputs: ValueSet;
  public readonly outputs: ValueSet;
  public enabled = false;

  protected _parametersProps = ['params', 'out', 'THREE', 'TSL', 'world', 'window', 'document'];
  protected _parameters: Array<any> = [null, null, THREE, Nodes, worldGlobal, null, null];
  protected _code: string = '';
  // eslint-disable-next-line @typescript-eslint/ban-types
  protected _main: Function;

  constructor(_inst: string, object3d?: T, public readonly editable = true) {
    super(_inst, 'Object3D', object3d);

    this.inputs = new Proxy({}, {
      set: (target, p, newValue, receiver) => {
        if (typeof p !== 'string') {
          return Reflect.set(target, p, newValue, receiver);
        }
        const ov = Reflect.get(target, p, receiver);
        if (ov === newValue) {
          return true;
        }
        if (this.eventDispatcher) {
          this.eventDispatcher.dispatchEvent({ type: 'nodeEventInputChanged', source: null as any, node: this, fields: [p] })
        }
        return Reflect.set(target, p, newValue, receiver);
      },
    });

    this.outputs = new Proxy({}, {
      set: (target, p, newValue, receiver) => {
        if (typeof p !== 'string') {
          return Reflect.set(target, p, newValue, receiver);
        }
        const ov = Reflect.get(target, p, receiver);
        if (ov === newValue) {
          return true;
        }
        if (this.eventDispatcher) {
          this.eventDispatcher.dispatchEvent({ type: 'nodeEventOutputChanged', source: null as any, node: this, fields: [p] })
        }
        return Reflect.set(target, p, newValue, receiver);
      },
    });

    this._parameters[0] = this.inputs;
    this._parameters[1] = this.outputs;

    this._main = this.compile();
  }

  get code() {
    return this._code;
  }

  set code(s: string) {
    this._code = s;
    try {
      this._main = this.compile();
    } catch (e) {
      console.warn(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async exec(e: Event) {
    if (this.enabled && this._code && this.object) {
      await this._main.call(this._objectRaw, ...this._parameters);
    }
  }

  getObjectsExtended<T1 extends ThreeNode | Object3D, T2 extends ThreeNode | Object3D>(): { in: T1; out: T2; } {
    return { in: this.inputs as any, out: this.outputs as any };
  }

  protected initTypes() {
    // do nothings, let them empty
  }

  addInput(name: string, type: PinTypeSupported): PinValueSupported | undefined {
    if (this.typesExtended.in[name]) {
      return undefined;
    }
    this.typesExtended.in[name] = { types: [type], direct: 'in', nname: /^[a-z]/.test(type) ? name : undefined };
    const v = createVarValueFromType(type);
    this.inputs[name] = v;
    return v;
  }
  removeInput(name: string) {
    if (!this.typesExtended.in[name]) {
      return false;
    }
    delete this.typesExtended.in[name];
    delete this.inputs[name];
    return true;
  }

  addOutput(name: string, type: PinTypeSupported): PinValueSupported | undefined {
    if (this.typesExtended.out[name]) {
      return undefined;
    }
    this.typesExtended.out[name] = { types: [type], direct: 'out', nname: /^[a-z]/.test(type) ? name : undefined };
    const v = createVarValueFromType(type);
    this.outputs[name] = v;
    return v;
  }
  removeOutput(name: string) {
    if (!this.typesExtended.out[name]) {
      return false;
    }
    delete this.typesExtended.out[name];
    delete this.outputs[name];
    return true;
  }

  serialize(json: any): void {
    super.serialize(json);
    json.object = this.object?.uuid;
    json.types = { ...this.typesExtended };
    json.enabled = this.enabled;
    // do not save editable
    // json.editable = this.editable;
    json.inputs = {};
    for (const [k, t] of Object.entries(this.typesExtended.in)) {
      json.inputs[k] = toJsonByType(t.types[0], this.inputs[k]);
    }
    json.outputs = {};
    for (const [k, t] of Object.entries(this.typesExtended.out)) {
      json.outputs[k] = toJsonByType(t.types[0], this.outputs[k]);
    }
    json.code = this._code;
  }

  deserialize(json: any): void {
    super.deserialize(json);
    if (json.types?.in) {
      emptyObject(this.typesExtended.in);
      Object.assign(this.typesExtended.in, json.types.in);
    }
    for (const [k, v] of Object.entries(this.typesExtended.in)) {
      const vv = json.inputs ? json.inputs[k] : undefined;
      this.inputs[k] = createVarValueFromType(v.types[0], vv);
    }
    if (json.types?.out) {
      emptyObject(this.typesExtended.out);
      Object.assign(this.typesExtended.out, json.types.out);
    }
    for (const [k, v] of Object.entries(this.typesExtended.out)) {
      const vv = json.outputs ? json.outputs[k] : undefined;
      this.outputs[k] = createVarValueFromType(v.types[0], vv);
    }
    if (json.code !== undefined) {
      this.code = json.code;
    }
    this.enabled = json.enabled;
    // has been mark as readonly member
    // this.editable = json.editable ?? true;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected compile(): Function {
    return new AsyncFunction(this._parametersProps, this._code);
  }
}

addNodeClass('ScriptNode', ScriptNode,
  {
    enabled: 'Boolean',
    code: 'Script',
  }, 'ObjectNode',
);