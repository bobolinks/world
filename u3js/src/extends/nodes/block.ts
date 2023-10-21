import { Object3D, } from "three";
import type { ObjectsMap, } from "../../types/types";
import { ScriptNode } from "./script";
import { addNodeClass } from "../helper/clslib";

export class ScriptBlockNode<T extends Object3D = Object3D> extends ScriptNode<T> {
  public readonly isScriptBlockNode = true;

  protected _prev?: ScriptBlockNode;
  protected _next?: ScriptBlockNode;

  get prev() {
    return this._prev;
  }

  set prev(v: ScriptBlockNode | undefined) {
    this._prev = v;
  }

  get next() {
    return this._next;
  }

  set next(v: ScriptBlockNode | undefined) {
    this._next = v;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async exec(e: Event) {
    if (this.enabled && this.object) {
      const result = this._code ? await this._main.call(this._objectRaw, ...this._parameters) : true;
      if (result !== false && this._next) {
        await this._next.exec(e);
      }
    }
  }

  fill(root: Object3D, objects: ObjectsMap): void {
    super.fill(root, objects);

    if (this.prev && typeof this.prev === 'string') {
      this.prev = objects[this.prev] as any;
    }

    if (this.next && typeof this.next === 'string') {
      this.next = objects[this.next] as any;
    }
  }

  serialize(json: any): void {
    super.serialize(json);
    json.prev = this.prev?.uuid;
    json.next = this.next?.uuid;
  }

  deserialize(json: any): void {
    super.deserialize(json);
    this.prev = json.prev;
    this.next = json.next;
  }
}

addNodeClass('ScriptBlockNode', ScriptBlockNode, {}, 'ScriptNode', {
  scriptBlock: { clsName: 'UpdateNode', func: () => new ScriptBlockNode('scriptBlock'), group: 'Scripts.Script Block', icon: 'brand-javascript' }
});