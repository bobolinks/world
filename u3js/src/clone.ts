import { Object3D } from "three";
import type { ObjectsTransfer } from "./types/types";

export const objectsTransferred: ObjectsTransfer<Object3D> = new WeakMap();
const objectsTransferredKey = new Set<Object3D>();

// hack
const rawClone = Object3D.prototype.clone;
Object3D.prototype.clone = function (recursive?: boolean): any {
  const cloned = rawClone.call(this, recursive);
  objectsTransferred.set(this, cloned);
  return cloned;
}

export function cloneTracingBegin() {
  for (const key of objectsTransferredKey) {
    objectsTransferred.delete(key);
  }
  objectsTransferredKey.clear();
}

export function cloneTracingEnd() {
  for (const key of objectsTransferredKey) {
    objectsTransferred.delete(key);
  }
  objectsTransferredKey.clear();
}

export function clone<T extends Object3D = Object3D>(object: T, recursive?: boolean, root?: T): T {
  cloneTracingBegin();
  const cloned = object.clone(recursive);

  object.traverse((o: Object3D) => {
    if (!o.graph) {
      return;
    }
    const cloned = objectsTransferred.get(o);
    if (!cloned) {
      return;
    }
    cloned.graph = o.graph.clone(root || object, objectsTransferred);
  });

  cloneTracingEnd();

  return cloned;
}