import { EventDispatcher } from "three";

export type SceneEditorEvent = 'objectChanged' | 'objectModified';
export type SceneEditorEventMap = {
  objectChanged: { type: 'objectChanged'; soure: EventDispatcher; object: THREE.Object3D | undefined };
  objectModified: { type: 'objectModified'; soure: EventDispatcher; objects: THREE.Object3D[]; };
};
