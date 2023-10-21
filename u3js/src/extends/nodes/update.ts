import { Camera, Object3D, WebGLRenderer } from "three";
import type { UpdatableNode } from "../../types/types";
import { ScriptNode } from "./script";
import { addNodeClass } from "../helper/clslib";

export class UpdateNode<T extends Object3D = Object3D> extends ScriptNode<T> implements UpdatableNode {
  public readonly isUpdateNode = true;

  constructor(_inst: string, object3d?: T) {
    super(_inst, object3d);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUpdate(renderer: WebGLRenderer, camera: Camera, delta: number, now: number) {
    if (this.enabled && this._code && this.object) {
      try {
        this._main.call(this._objectRaw, ...this._parameters, delta, now);
      } catch (e) {
        console.error(e);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected compile(): Function {
    return new Function(...this._parametersProps, 'delta', 'now', this._code);
  }
}

addNodeClass('UpdateNode', UpdateNode, {}, 'ScriptNode', {
  update: { clsName: 'UpdateNode', func: () => new UpdateNode('update'), group: 'Scripts.On Update', icon: 'refresh' },
});