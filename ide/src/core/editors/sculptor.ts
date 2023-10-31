/* eslint-disable @typescript-eslint/no-unused-vars */
import { Camera, EventDispatcher, Mesh, Object3D, Scene, WebGLRenderer } from "three";
import type { HistoryManager } from "u3js/src/types/types";
import { SceneEditorEventMap } from "./event";

export class Sculptor extends Scene {
  private _mesh?: Mesh;
  private _actived = false;

  constructor(public readonly context: HTMLCanvasElement, public readonly history: HistoryManager, public readonly dispatcher: EventDispatcher<SceneEditorEventMap>) {
    super();
  }

  set mesh(m: Mesh) {
    this._mesh = m;
  }

  get actived() {
    return this._actived;
  }
  set actived(val: boolean) {
    this._actived = val;
  }
}