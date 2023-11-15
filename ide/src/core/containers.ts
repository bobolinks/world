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
  constructor() {
    super();
    this.name = BuiltinSceneOperator;
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

      if (mesh.name !== '') brush.name = this.name;
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

      return brush;
    });
    return super.add(...object);
  }
}

addThreeClass('OperationScene', {
  create: () => new OperationScene(),
  members: {},
  proto: 'Scene',
  group: '',
  icon: '',
});
