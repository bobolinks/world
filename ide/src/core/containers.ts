import { Mesh, Object3D, Object3DEventMap, Scene } from "three";
import { Brush } from "three-bvh-csg";
import { BuiltinSceneSpawns, } from "u3js/src";
import { addThreeClass } from "u3js/src/extends/three/utils";

export const BuiltinSceneOperator = '[Operator]';

export class SpawnsScene extends Scene {
  constructor() {
    super();
    this.name = BuiltinSceneSpawns;
  }
}

addThreeClass('SpawnsScene', {
  create: () => new SpawnsScene(),
  members: {},
  proto: 'PhysicalScene',
  group: '',
  icon: '',
});

export class OperationScene extends Scene {
  private varNames = 'abcdefghijklmnopqrstuvwxyz'.split('').reverse();

  constructor() {
    super();
    (this as any).type = 'OperationScene';
    this.name = BuiltinSceneOperator;
    this.userData.varNames = this.varNames;
  }

  deserialize() {
    if (this.userData.varNames) {
      this.varNames = this.userData.varNames;
    }
  }

  add(...object: Object3D<Object3DEventMap>[]): this {
    object = object.map((e: Object3D) => {
      if (!((e as any).isMesh)) {
        return e;
      }
      if ((e as any).isBrush) {
        return e;
      }
      const mesh = e as Mesh;
      const brush = new Brush(mesh.geometry, mesh.material);
      brush.uuid = mesh.uuid;

      if (mesh.name !== '') brush.name = e.name;
      if (mesh.castShadow === true) brush.castShadow = true;
      if (mesh.receiveShadow === true) brush.receiveShadow = true;
      if (mesh.visible === false) brush.visible = false;
      if (mesh.frustumCulled === false) brush.frustumCulled = false;
      if (mesh.renderOrder !== 0) brush.renderOrder = mesh.renderOrder;
      if (Object.keys(mesh.userData).length > 0) brush.userData = mesh.userData;

      brush.layers.mask = mesh.layers.mask;
      brush.matrix.copy(mesh.matrix);
      brush.matrix.decompose(brush.position, brush.quaternion, brush.scale);
      brush.up.copy(mesh.up);

      if (mesh.matrixAutoUpdate === false) brush.matrixAutoUpdate = false;

      if (!brush.name) {
        brush.name = this.varNames.pop() as string;
      }

      return brush;
    });
    return super.add(...object);
  }

  remove(...object: Object3D[]): this {
    object = object.map(e => this.children.find(ee => ee.uuid === e.uuid)) as any;
    for (const child of object) {
      if (child.name && child.name.length === 1 && this.varNames.findIndex(e => e === child.name) === -1) {
        this.varNames.push(child.name);
      }
    }
    return super.remove(...object);
  }
}

addThreeClass('OperationScene', {
  create: () => new OperationScene(),
  members: {},
  proto: 'Scene',
  group: '',
  icon: '',
});
