/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
// @ts-ignore
import { nodeFrame } from 'three/examples/jsm/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { PhysicalScene } from "./extends/three/scene";
import { LoadingScene } from "./loading";
import { ObjectLoader } from "./loader";
import { emptyObject } from "./extends/three/utils";
import { clone } from "./clone";
import { logger } from "./extends/helper/logger";
import worldGlobal, { MaxGPUComputeWidth, MaxGPUComputeHeight } from "./extends/three/worldGlobal";

declare global {
  interface Window {
    world: U3JsRuntime;
  }
}

export interface WorldSettings {
  // screen: 
  aspect: number | 'auto';
  // render:
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
  shadowMap?: {
    enabled: boolean;
    type: THREE.ShadowMapType;
  };
}

const defaultWorldSetting: WorldSettings = {
  aspect: 'auto',
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
  shadowMap: {
    enabled: true,
    type: THREE.PCFSoftShadowMap,
  },
};

export class U3JsRuntime extends THREE.EventDispatcher {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly clock: THREE.Clock;
  public readonly size: { width: number; height: number } = { width: 640, height: 480 };
  public readonly uuid = THREE.MathUtils.generateUUID();

  protected defaultScene: PhysicalScene = new LoadingScene();
  protected currentScene: PhysicalScene;
  protected currentCamera: THREE.Camera;
  protected defaultCamera: THREE.PerspectiveCamera;

  protected working = false;

  // for app
  protected settings: WorldSettings = { ...defaultWorldSetting };
  protected readonly scenes: Array<PhysicalScene> = [];
  protected spawns: PhysicalScene | undefined;

  constructor(public readonly context: HTMLCanvasElement) {
    super();

    Object.assign(worldGlobal, {
      navigateTo: this.navigateTo.bind(this),
      setCamera: this.setCamera.bind(this),
      spawn: this.createObjectFromSpawn.bind(this),
    });

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.context,
      antialias: true,
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setClearColor(0xffffff);

    worldGlobal.gpuComputeRender = new GPUComputationRenderer(MaxGPUComputeWidth, MaxGPUComputeHeight, this.renderer);

    // clock
    this.clock = new THREE.Clock();

    // scene
    this.currentScene = this.defaultScene;

    // camera
    this.defaultCamera = new THREE.PerspectiveCamera(50, 1, 0.001, 1000);
    this.defaultCamera.name = 'Perspective';
    this.defaultCamera.position.set(4, 3, 8);
    this.defaultCamera.lookAt(0, 0, 0);

    const camera: THREE.Camera = this.currentScene.getObjectByProperty('isCamera', true) as any || this.defaultCamera;
    this.currentCamera = camera;

    this.resize(this.context.width, this.context.height);
  }

  resize(width: number, height: number) {
    if (!this.context) {
      return;
    }

    this.size.width = width;
    this.size.height = height;

    const aspect = this.size.width / this.size.height;

    this.renderer.setViewport(0, 0, width, height);

    if (this.currentCamera) {
      if (this.currentCamera instanceof THREE.PerspectiveCamera) {
        this.currentCamera.aspect = aspect;
        this.currentCamera.updateProjectionMatrix();
      } else if (this.currentCamera instanceof THREE.OrthographicCamera) {
        this.currentCamera.top = this.currentCamera.right / aspect;
        this.currentCamera.bottom = -this.currentCamera.top;
        this.currentCamera.updateProjectionMatrix();
      }
    }
  }

  navigateTo(name: string) {
    const scene = this.scenes.find(e => e.uuid === name || e.name === name);
    if (!scene) {
      console.error(`Scene[${name}] not found`);
      return;
    }

    if (this.currentScene === scene) {
      return;
    }

    if (this.currentScene) {
      this.currentScene.deactive();
    }
    this.currentScene = scene;
    this.currentScene.active();

    const camera: THREE.Camera = scene.getObjectByProperty('isCamera', true) as any || this.defaultCamera;
    this.setCamera(camera);
  }

  createObjectFromSpawn(name: string) {
    if (!this.spawns) {
      return undefined;
    }
    const spawn = this.spawns.children.find(e => e.name === name);
    if (!spawn) {
      return undefined;
    }
    return clone(spawn, true, this.spawns);
  }

  setCamera(camera: THREE.Camera) {
    if (this.currentCamera === camera) {
      return;
    }

    this.currentCamera = camera;

    if (this.currentCamera) {
      const aspect = this.size.width / this.size.height;
      if (this.currentCamera instanceof THREE.PerspectiveCamera) {
        this.currentCamera.aspect = aspect;
        this.currentCamera.updateProjectionMatrix();
      } else if (this.currentCamera instanceof THREE.OrthographicCamera) {
        this.currentCamera.top = this.currentCamera.right / aspect;
        this.currentCamera.bottom = -this.currentCamera.top;
        this.currentCamera.updateProjectionMatrix();
      }
    }
  }

  async load(url: string) {
    const loader = new ObjectLoader();
    const response = await fetch(url);
    const json = await response.json()
    const root = await loader.parseAsync(json);

    // load global settings
    const { object } = json;
    if ((object as any).world) {
      emptyObject(this.settings);
      Object.assign(this.settings, { ...defaultWorldSetting, ...(object as any).world });
    }
    if (!this.settings.aspect) {
      this.settings.aspect = 'auto';
    }

    // load scenes
    this.scenes.length = 0;
    for (const child of root.children) {
      if (child.name === '[Spawns]') {
        this.spawns = child as PhysicalScene;
      } else {
        this.scenes.push(child as PhysicalScene);
      }
    }

    const scene = (this.scenes.find(e => e.name === 'index') || this.scenes[0] || this.defaultScene) as PhysicalScene;

    this.navigateTo(scene.uuid);
  }

  private render(delta: number, now: number) {
    worldGlobal.delta = delta;
    worldGlobal.now = now;
    this.currentScene.update(this.renderer, this.currentCamera, delta, now);
    nodeFrame.update();
    this.renderer.render(this.currentScene, this.currentCamera);
  }

  async run(): Promise<void> {
    if (this.working) {
      throw logger.panic('already working');
    }

    this.working = true;
    this.clock.start();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const step = (timestamp: DOMHighResTimeStamp, frame: XRFrame) => {
      if (!this.working) {
        this.renderer.setAnimationLoop(null);
        return;
      }
      const delta = this.clock.getDelta();
      const now = this.clock.oldTime;
      this.render(delta, now);
    };
    this.renderer.setAnimationLoop(step);
  }

  dispose(): void {
    this.clock.stop();
    this.renderer.dispose();
  }
}