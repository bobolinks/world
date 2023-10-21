/* eslint-disable prefer-rest-params */
import { Object3D } from "three";

export function hookObjectInEditorMode(object: Object3D) {
  const anyObj: any = object;
  if (anyObj.__isInEditorMode) {
    return;
  }
  anyObj.__isInEditorMode = true;
  anyObj.__add = object.add;
  anyObj.__remove = object.remove;
  anyObj.__removeFromParent = object.removeFromParent;

  anyObj._add = function (...object: Object3D[]): Object3D {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this._add(arguments[i]);
      }
      return this;
    }
    if (object === this) {
      console.error('THREE.Object3D.add: object can\'t be added as a child of itself.', object);
      return this;
    }
    if (object instanceof Object3D) {
      if (object.parent !== null) {
        const rmf = ((object.parent as any)._remove || object.parent.remove);
        rmf.call(object.parent, object);
      }
      object.parent = this;
      this.children.push(object);
      object.dispatchEvent({ type: 'added' });
    } else {
      console.error('THREE.Object3D.add: object not an instance of THREE.Object3D.', object);
    }
    return this;
  }
  object.add = function (): Object3D {
    console.log('add object');
    return this;
  }

  anyObj._remove = function (...object: Object3D[]): Object3D {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this._remove(arguments[i]);
      }
      return this;
    }
    const index = this.children.indexOf(object);
    if (index !== - 1) {
      (object as any).parent = null;
      this.children.splice(index, 1);
      (object as any).dispatchEvent({ type: 'removed' });
    }
    return this;
  }
  object.remove = function (): Object3D {
    console.log('remove object');
    return this;
  }

  anyObj._removeFromParent = function (): Object3D {
    const parent = this.parent;
    if (parent !== null) {
      const rmf = ((parent as any)._remove || parent.remove);
      rmf.call(parent, this);
    }
    return this;
  }
  object.removeFromParent = function (): Object3D {
    console.log('removeFromParent object');
    return this;
  }
}