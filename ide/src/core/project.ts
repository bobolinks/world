import * as THREE from 'three';
import { ACESFilmicToneMapping, Object3D, PCFSoftShadowMap, Scene, EventDispatcher, PerspectiveCamera, Camera, BoxGeometry, Mesh, } from "three";
import { MeshBasicNodeMaterial, UniformNode, } from "three/examples/jsm/nodes/Nodes";
import type { UserEventMap } from './u3js/types/types';
import apis from "../apis";
import Net from '../utils/net';
import { toJSON } from "./u3js/serializer";
import { ObjectLoader } from './u3js/loader';
import { PhysicalScene } from './u3js/extends/three/scene';
import { createObject, emptyObject } from './u3js/extends/three/utils';
import { Graph } from './u3js/extends/graph/graph';
import { WorldSettings } from "./world";
import { SpawnsScene } from './spawns';
import { BuiltinSceneSpawns, } from './u3js';
import { ScriptNode } from './u3js/extends/nodes/script';
import { ScriptBlockNode } from './u3js/extends/nodes/block';

// disable script in editor mode
ScriptNode.prototype.exec = function () { } as any;
ScriptBlockNode.prototype.exec = function () { } as any;

type ObjectJson = {
  [key: string]: any;
  uuid: string;
  type: string;
  userData: { [key: string]: any; };
  children: Array<ObjectJson>;
};

export interface ProjectJson {
  [key: string]: any;
  revision: number;
  scene: string;
  camera: string;
  world: WorldSettings;
  userData: { [key: string]: any; };
  children: Array<ObjectJson>;
}

const defaultWorldSetting: WorldSettings = {
  aspect: 'auto',
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
  shadowMap: {
    enabled: true,
    type: PCFSoftShadowMap,
  },
};

function defaultCamera() {
  const camera = new PerspectiveCamera(50, 1, 0.001, 1000);
  camera.name = 'defaultCamera';
  camera.position.set(1, 1, 1);
  camera.lookAt(0, 0, 0);
  return camera;
}

export type ProjectEvent = 'projectLoaded' | 'sceneChanged' | 'treeModified' | 'objectChanged' | 'objectAdded' | 'objectRemoved';
export type ProjectEventMap = {
  projectLoaded: { type: ProjectEvent; soure: EventDispatcher; project: Project; };
  sceneChanged: { type: ProjectEvent; soure: EventDispatcher; scene: Scene; };
  treeModified: { type: ProjectEvent; soure: EventDispatcher; root: Object3D; };
  objectChanged: { type: ProjectEvent; soure: EventDispatcher; object: Object3D; };
  objectAdded: { type: ProjectEvent; soure: EventDispatcher; object: Object3D; };
  objectRemoved: { type: ProjectEvent; soure: EventDispatcher; object: Object3D; };
};

export class Project extends EventDispatcher<ProjectEventMap & UserEventMap> {
  public readonly json: ProjectJson;
  public readonly world: WorldSettings;
  public readonly uuid = THREE.MathUtils.generateUUID();
  public readonly textures: Record<string, THREE.Texture> = {};

  scene: PhysicalScene;
  readonly scenes: Array<PhysicalScene> = [];
  readonly cameras: Array<Camera> = [];

  private _revision = 0;

  constructor(public name: string) {
    super();

    this.world = { ...defaultWorldSetting };

    this.json = {
      revision: 0,
      scene: 'defaultScene',
      camera: 'defaultCamera',
      world: this.world,
      userData: {},
      children: [],
    };

    this.scene = new PhysicalScene();
    this.scene.name = 'defaultScene';
    this.scenes.push(this.scene, new SpawnsScene);

    const camera = defaultCamera();
    this.cameras.push(camera);
    this.addObject(camera);
  }

  get revision() {
    return this._revision;
  }

  async load(ignoreEvent?: boolean): Promise<this> {
    const loader = new ObjectLoader();
    let json = await Net.request({ url: `/fs/file/${this.name}/index.json` }) as ProjectJson;
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }
    const root = await loader.parseAsync(json);

    emptyObject(this.textures);
    for (const txt of Object.values((loader as any)._textures) as any) {
      if (txt.userData.name) {
        this.textures[txt.uuid] = txt;
      }
    }

    emptyObject(this.json);
    Object.assign(this.json, json);

    // load global settings
    const { object } = json;
    if ((object as any).world) {
      emptyObject(this.world);
      Object.assign(this.world, { ...defaultWorldSetting, ...(object as any).world });
    }
    if (!this.world.aspect) {
      this.world.aspect = 'auto';
    }
    this._revision = object.revision || 0;

    // load scenes
    for (const child of this.scenes) {
      child.dispose();
    }
    this.scenes.length = 0;
    this.scenes.push(...root.children as Array<PhysicalScene>);
    // build default spawns scene
    if (!this.scenes.find(e => e.name === BuiltinSceneSpawns)) {
      this.scenes.push(new SpawnsScene);
    }
    this.scene = (this.scenes.find(e => e.name === object.scene) || this.scenes[0]) as PhysicalScene;

    this.scenes.forEach(e => this.hookInEditorMode(e));

    // load cameras
    this.cameras.length = 0;
    this.scene.traverse((obj) => {
      if (obj instanceof Camera) {
        this.cameras.push(obj);
      }
    });
    if (this.scene.name !== BuiltinSceneSpawns && !this.cameras.length) {
      const camera = defaultCamera();
      this.cameras.push(camera);
      this.addObject(camera);
    }

    if (!ignoreEvent) {
      this.dispatchEvent({ type: 'projectLoaded', soure: this, project: this });
    }

    return this;
  }
  toJSON() {
    const root = new Object3D();

    root.children = this.scenes;

    const data = toJSON(root, this.textures);

    root.children = [];
    root.nodes = undefined;

    data.object.revision = this.revision;
    data.object.world = this.world;
    data.object.scene = this.scene.name;

    return data;
  }

  async flush(): Promise<void> {
    const json = this.toJSON();
    return apis.write(`/fs/write/${this.name}/index.json`, json);
  }

  newScene() {
    this.scene = new PhysicalScene();
    this.scene.name = this.scene.uuid;
    this.scenes.push(this.scene);

    const camera = defaultCamera();
    this.cameras.length = 0;
    this.cameras.push(camera);
    this.addObject(camera);

    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicNodeMaterial({
      opacity: 1,
    }));
    mesh.material.colorNode = new UniformNode(new THREE.Color());
    this.addObject(mesh);

    this._revision++;

    this.dispatchEvent({ type: 'objectAdded', soure: this, object: this.scene });
    this.dispatchEvent({ type: 'sceneChanged', soure: this, scene: this.scene });
  }
  setScene(name: string) {
    const scene = this.scenes.find(e => e.name === name) as PhysicalScene;
    if (!scene) {
      return;
    }

    this.scene = scene;
    this.cameras.length = 0;
    this.scene.traverse((obj) => {
      if (obj instanceof Camera) {
        this.cameras.push(obj);
      }
    });

    if (scene.name !== BuiltinSceneSpawns && !this.cameras.length) {
      const camera = defaultCamera();
      this.cameras.length = 0;
      this.cameras.push(camera);
      this.addObject(camera);
    }

    this.dispatchEvent({ type: 'sceneChanged', soure: this, scene: this.scene });
  }
  removeScene(scene: PhysicalScene): boolean {
    if (scene.name === BuiltinSceneSpawns) {
      return false;
    }
    if (this.scenes.length === 1) {
      return false;
    }

    const index = this.scenes.findIndex((e) => e.id === scene.id);
    if (index === -1) {
      return true;
    }
    this.scenes.splice(index, 1);

    const sceneChanged = scene.id === this.scene.id;
    if (scene.id === this.scene.id) {
      this.scene = this.scenes[0];
    }

    this._revision++;

    if (sceneChanged) {
      this.dispatchEvent({ type: 'sceneChanged', soure: this, scene: this.scene });
    }

    return true;
  }
  addObject(object: Object3D, parent?: Object3D) {
    parent = parent || this.scene;

    if (object.parent === parent) {
      return object;
    }

    if (!object.graph) {
      (object as any).graph = new Graph(object);
    }

    this.hookInEditorMode(object);

    parent.add(object);

    this._revision++;

    this.dispatchEvent({ type: 'objectAdded', soure: this, object });
    this.dispatchEvent({ type: 'treeModified', soure: this, root: parent });
    return object;
  }
  addObjectByClass(name: string, parent?: Object3D, params?: any[]) {
    const object = createObject(name, ...(params || []));
    return this.addObject(object, parent);
  }
  removeObject(object: Object3D) {
    if ((object as any).isScene) {
      return this.removeScene(object as any);
    }
    const o = this.scene.getObjectById(object.id);
    if (!o) {
      return false;
    }

    const parent = o.parent;

    o.removeFromParent();

    const index = this.cameras.indexOf(o as any);
    if (index !== -1) {
      this.cameras.splice(index, 1);
    }

    this._revision++;

    this.dispatchEvent({ type: 'objectRemoved', soure: this, object });
    this.dispatchEvent({ type: 'treeModified', soure: this, root: parent || this.scene });

    return true;
  }
  increaseRevision() {
    this._revision++;
  }

  hookInEditorMode(object: Object3D) {
    object.traverse((e: any) => {
      if (!e.__disp) {
        e.__disp = e.dispatchEvent;
        e.dispatchEvent = (event: any) => {
          console.log(`Receive event[${event.type}] from object[${e.uuid}] in editor mode!`);
          e.__disp.call(e, event);
        };
      }
    });
  }
}
