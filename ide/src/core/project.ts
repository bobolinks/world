import * as THREE from 'three';
import { ACESFilmicToneMapping, Object3D, PCFSoftShadowMap, Scene, EventDispatcher, PerspectiveCamera, Camera, } from "three";
import type { UserEventMap } from 'u3js/src/types/types';
import apis from "../apis";
import Net from '../utils/net';
import { Output, toJSON } from "u3js/src/serializer";
import { ObjectLoader } from 'u3js/src/loader';
import { PhysicalScene } from 'u3js/src/extends/three/scene';
import { addThreeClass, createObject, emptyObject } from 'u3js/src/extends/three/utils';
import { Graph } from 'u3js/src/extends/graph/graph';
import { SpawnsScene } from './spawns';
import { BuiltinSceneSpawns, WorldSettings, } from 'u3js/src';
import { ScriptNode } from 'u3js/src/extends/nodes/script';
import { ScriptBlockNode } from 'u3js/src/extends/nodes/block';
import { jsImport } from 'u3js/src/extends/helper/import';
import type { pluginInstall } from 'u3js/src/types/plugin';
import { addConstructor, addNodeClass } from 'u3js/src/extends/helper/clslib';
import { addEffectClass } from 'u3js/src/extends/three/effect';
import { logger } from 'u3js/src/extends/helper/logger';

export const BuiltinSceneSculptor = '[Sculptor]';

// disable script in editor mode
ScriptNode.prototype.exec = function () { } as any;
ScriptBlockNode.prototype.exec = function () { } as any;

interface ProjectOutput extends Output {
  project: {
    revision: number;
    scene: string;
    world: WorldSettings;
    plugins: string[];
  };
}

const defaultWorldSetting: WorldSettings = {
  resolution: 'auto',
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
  shadowMap: {
    enabled: true,
    type: PCFSoftShadowMap,
  },
  vrEnable: false,
};

function defaultCamera() {
  const camera = new PerspectiveCamera(50, 1, 0.001, 1000);
  camera.name = 'defaultCamera';
  camera.position.set(1, 1, 1);
  camera.lookAt(0, 0, 0);
  return camera;
}

export type ProjectEvent = 'projectLoaded' | 'projectSettingsChanged' | 'sceneChanged' | 'treeModified' | 'objectChanged' | 'objectAdded' | 'objectRemoved';
export type ProjectEventMap = {
  projectLoaded: { type: ProjectEvent; soure: EventDispatcher; project: Project; };
  projectSettingsChanged: { type: 'projectSettingsChanged', soure: EventDispatcher; project: Project; };
  sceneChanged: { type: ProjectEvent; soure: EventDispatcher; scene: Scene; };
  treeModified: { type: ProjectEvent; soure: EventDispatcher; root: Object3D; };
  objectChanged: { type: ProjectEvent; soure: EventDispatcher; object: Object3D; };
  objectAdded: { type: ProjectEvent; soure: EventDispatcher; object: Object3D; };
  objectRemoved: { type: ProjectEvent; soure: EventDispatcher; object: Object3D; };
};

export class Project extends EventDispatcher<ProjectEventMap & UserEventMap> {
  public readonly world: WorldSettings;
  public readonly uuid = THREE.MathUtils.generateUUID();
  public readonly textures: Record<string, THREE.Texture> = {};
  public readonly plugins = new Set<string>;

  public scene: Scene;
  readonly scenes: Array<Scene> = [];
  readonly cameras: Array<Camera> = [];
  readonly selectedObjects: Array<THREE.Object3D> = [];

  private _revision = 0;

  constructor(public name: string) {
    super();

    this.world = { ...defaultWorldSetting };

    this.scene = new PhysicalScene();
    this.scene.name = 'index';
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
    let json = await Net.request({ url: `/fs/file/${this.name}/index.json` }) as ProjectOutput;
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }

    // install plugins first
    if (json.project.plugins) {
      this.plugins.clear();
      try {
        json.project.plugins.forEach(e => this.plugins.add(e));
        const plugins: Array<{ pluginInstall: typeof pluginInstall }> = await Promise.all(json.project.plugins.map(e => jsImport(e)));
        for (const i in plugins) {
          const plugin = plugins[i];
          plugin.pluginInstall(
            addThreeClass,
            addEffectClass,
            addNodeClass,
            addConstructor,
          );
          const name = json.project.plugins[i].split('/').pop();
          logger.notice(`Plugin ${name} has been installed successfully!`);
        }
      } catch (e) {
        console.error(e);
      }
    }

    let root: any;
    try {
      root = await loader.parseAsync(json);
    } catch (e) {
      logger.error(e);
      throw e;
    }

    emptyObject(this.textures);
    for (const txt of Object.values((loader as any)._textures) as any) {
      if (txt.userData.name) {
        this.textures[txt.uuid] = txt;
      }
    }

    // load global settings
    if (json.project.world) {
      emptyObject(this.world);
      Object.assign(this.world, { ...defaultWorldSetting, ...json.project.world });
    }
    if (!this.world.resolution) {
      this.world.resolution = 'auto';
    }
    this._revision = json.project.revision || 0;

    // load scenes
    for (const child of this.scenes) {
      if ((child as any).dispose) {
        (child as any).dispose();
      }
    }
    this.scenes.length = 0;
    this.scenes.push(...root.children);
    // build default spawns scene
    if (!this.scenes.find(e => e.name === BuiltinSceneSpawns)) {
      this.scenes.push(new SpawnsScene);
    }
    // build default sculptor scene
    if (!this.scenes.find(e => e.name === BuiltinSceneSculptor)) {
      const sculptor = new Scene;
      sculptor.name = BuiltinSceneSculptor;
      this.scenes.push(sculptor);
    }
    this.scene = (this.scenes.find(e => e.name === json.project.scene) || this.scenes[0]) as PhysicalScene;

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

    const output: ProjectOutput = toJSON(root, this.textures) as any;

    root.children = [];
    root.nodes = undefined;

    output.project = {
      revision: this.revision,
      world: this.world,
      scene: [BuiltinSceneSpawns, BuiltinSceneSculptor].includes(this.scene.name) ? '' : this.scene.name,
      plugins: [...this.plugins],
    };

    return output;
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

    this._revision++;

    this.dispatchEvent({ type: 'objectAdded', soure: this, object: this.scene });
    this.dispatchEvent({ type: 'sceneChanged', soure: this, scene: this.scene });
  }
  setScene(name: string, ignoreEvent?: boolean) {
    const scene = this.scenes.find(e => e.name === name);
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

    if (![BuiltinSceneSpawns, BuiltinSceneSculptor].includes(scene.name) && !this.cameras.length) {
      const camera = defaultCamera();
      this.cameras.length = 0;
      this.cameras.push(camera);
      this.addObject(camera);
    }

    if (!ignoreEvent) {
      this.dispatchEvent({ type: 'sceneChanged', soure: this, scene: this.scene });
    }
  }
  removeScene(scene: Scene): boolean {
    if ([BuiltinSceneSpawns, BuiltinSceneSculptor].includes(scene.name)) {
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
          logger.debug(`Received event[${event.type}] from object[${e.uuid}] in editor mode!`);
          e.__disp.call(e, event);
        };
      }
    });
  }
}
