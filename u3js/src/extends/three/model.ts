import { Box3, BoxGeometry, BufferGeometry, CapsuleGeometry, Group, Material, Matrix4, MeshBasicMaterial, Object3D, Object3DEventMap, SphereGeometry, Texture, Vector3 } from "three";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import type { Meta } from "../../types/types";
import { logger } from "../helper/logger";
import { addThreeClass } from "./utils";
import { Output } from "../../serializer";
import { BodyType, Entity } from "./entity";
import { AmmoUtils } from "../../libs/ammo";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

export class Model3D<
  TGeometry extends SphereGeometry | CapsuleGeometry | BoxGeometry = SphereGeometry,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, MeshBasicMaterial, TEventMap> {
  public isModel3D = true;

  protected _model = '';
  protected _modelRoot: GLTF | Group = null as any;
  protected _modeMatrix?: Matrix4;
  protected _object?: Object3D;
  protected _isLoading = false;
  protected _castShadowModel = false;
  protected _receiveShadowModel = false;
  protected _objectOrgSize = new Vector3();

  constructor(geometry?: TGeometry, material?: MeshBasicMaterial, bodyType = 0, mass = 0) {
    super(geometry || new SphereGeometry(0.1) as any, material || new MeshBasicMaterial({ wireframe: true, transparent: true }) as any, bodyType, mass);

    (this as any).type = 'Model3D';

    this._castShadowModel = this.castShadow;
    this._receiveShadowModel = this.receiveShadow;

    this.onBeforeRender = () => {
      if (this._castShadowModel !== this.castShadow || this._receiveShadowModel !== this.receiveShadow) {
        this.updateModelShadow();
      }
    };

    if (!this.geometry.boundingBox) {
      this.geometry.computeBoundingBox();
    }
  }

  get model() {
    return this._model;
  }
  set model(newModel: string) {
    if (this._model === newModel) {
      return;
    }
    // clear all data
    if (this._object) {
      this._object.removeFromParent();
    }
    if (this._model) {
      this._modeMatrix = undefined;
    }
    this._model = newModel;
    this.loadModel();
  }

  protected async loadModel() {
    if (this._object) {
      this._object.removeFromParent();
      this._object = undefined;
    }
    if (!this._model) {
      return;
    }

    this._isLoading = true;
    let loader: GLTFLoader | FBXLoader | null;
    if (/.glb$/i.test(this._model)) {
      loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
    } else if (/.fbx$/i.test(this._model)) {
      loader = new FBXLoader();
    } else {
      throw logger.panic(`Model[${this._model}] is not supported!`);
    }

    const model = await loader.loadAsync(this._model);
    if (model instanceof Group) {
      this._object = model;
    } else {
      this._object = model.scene;
    }
    this._modelRoot = model;
    (this._object as any)['__isHidden'] = true;

    this._isLoading = false;
    this.material.visible = false;

    this.add(this._object);

    this.objectAutoSize();
    this.updateModelShadow();
  }

  protected rebuildGeometry() {
    super.rebuildGeometry();
    this.resizeObject();
  }

  protected resizeObject() {
    if (!this._object || !this.geometry.boundingBox) {
      return;
    }

    this.updateMatrixWorld(true);
    this._object.updateMatrixWorld(true);

    const size = this.geometry.boundingBox.getSize(new Vector3());
    const scale = size.divide(this._objectOrgSize);
    const maxScale = Math.min(scale.x, scale.y, scale.z);

    this._object.scale.set(maxScale, maxScale, maxScale);
  }

  protected objectAutoSize() {
    if (!this._object || !this.geometry.boundingBox) {
      return;
    }

    this.updateMatrixWorld(true);
    this._object.updateMatrixWorld(true);

    if (this._modeMatrix) {
      return this._object.applyMatrix4(this._modeMatrix);
    }

    const size = this.geometry.boundingBox.getSize(new Vector3()).multiply(this.scale);
    const center = this.getWorldPosition(new Vector3)

    const box3Object = new Box3().setFromObject(this._object, true);
    const centerObject = box3Object.getCenter(new Vector3);
    const sizeObject = box3Object.getSize(this._objectOrgSize);

    const scale = size.divide(sizeObject);
    const maxScale = Math.min(scale.x, scale.y, scale.z);

    this._object.position.copy(center.sub(centerObject).multiply(scale));
    this._object.scale.set(maxScale, maxScale, maxScale);
  }

  private updateModelShadow() {
    if (!this._object) {
      return;
    }
    this._castShadowModel = this.castShadow;
    this._receiveShadowModel = this.receiveShadow;
    this._object.traverse(e => {
      e.castShadow = this._castShadowModel;
      e.receiveShadow = this._receiveShadowModel;
    });
  }

  toJSON(meta: Meta) {
    const object: any = {};
    const output: Output = {
      metadata: {
        version: 4.6,
        type: 'Object',
        generator: 'Object3D.toJSON'
      },
      object,
    } as any;

    object.uuid = this.uuid;
    object.type = this.type;

    if (this.name !== '') object.name = this.name;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;
    if (this.frustumCulled === false) object.frustumCulled = false;
    if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
    if (Object.keys(this.userData).length > 0) object.userData = this.userData;

    object.layers = this.layers.mask;
    object.matrix = this.matrix.toArray();
    object.up = this.up.toArray();

    if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

    object.geometry = serialize(meta.geometries, this.geometry);

    if (this.material !== undefined) {
      if (Array.isArray(this.material)) {
        const uuids = [];
        for (let i = 0, l = this.material.length; i < l; i++) {
          uuids.push(serialize(meta.materials, this.material[i]));
        }
        object.material = uuids;
      } else {
        object.material = serialize(meta.materials, this.material);
      }
    }

    if (this.children.length > 0) {
      object.children = [];
      for (const child of this.children) {
        // skip model object
        if (child === this._object) {
          continue;
        }
        object.children.push(child.toJSON(meta).object);
      }
    }

    return output;

    function serialize(library: { [key: string]: any }, element: BufferGeometry | Material | Texture) {
      if (library[element.uuid] === undefined) {
        library[element.uuid] = element.toJSON(meta);
      }
      return element.uuid;
    }
  }

  serialize(json: any) {
    super.serialize(json);
    json.model = this._model;
    json.objectOrgSize = this._objectOrgSize.toArray();
    if (this._object) {
      json.modeMatrix = this._object.matrix.toArray();
    }
  }

  deserialize(json: any) {
    super.deserialize(json);
    if (json.objectOrgSize) {
      this._objectOrgSize.fromArray(json.objectOrgSize);
    }
    if (json.modeMatrix) {
      this._modeMatrix = new Matrix4().fromArray(json.modeMatrix);
      if (this._object) {
        this._object.applyMatrix4(this._modeMatrix);
      }
    }
    this.model = json.model;
  }
}

addThreeClass('Model3D', {
  create: ({ material, geometry }: any = {}) => new Model3D(geometry, material),
  members: {
    model: 'String',
  },
  proto: 'Entity',
  group: '',
  icon: '',
});

export class StaticMesh<
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Model3D<BoxGeometry, TEventMap> {
  constructor(geometry?: BoxGeometry, material?: MeshBasicMaterial, bodyType = 0, mass = 0) {
    super(geometry || new BoxGeometry(1, 1, 1) as any, material, bodyType, mass);

    (this as any).type = 'StaticMesh';
  }

  protected rebuildBody() {
    if (!this._object) {
      return;
    }

    const world = this.world;

    // remove old body first
    if (this.physicalBody) {
      if (this.world) {
        this.world.removeMesh(this);
      }
      AmmoUtils.destroyBody(this.physicalBody);
    }

    // create body
    if (this._bodyType !== BodyType.Ghost) {
      // unsupport soft
      const pShape = AmmoUtils.createShape(this._object as any);
      (this as any).physicalBody = AmmoUtils.createBody(this, this._mass, pShape) as any;
      this.physicalBody.setUserIndex(this.id);
      if (world) {
        world.addMesh(this, this.physicalBody);
      }
    } else {
      (this as any).physicalBody = null as any;
    }
  }
}

addThreeClass('StaticMesh', {
  create: ({ material, geometry }: any = {}) => new StaticMesh(geometry, material),
  members: {
    'geo.width': 'Number',
    'geo.height': 'Number',
    'geo.depth': 'Number',
    model: 'String',
  },
  proto: 'Entity',
  group: 'Objects.Static Mesh',
  icon: 'mesh',
});
