/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import { ACESFilmicToneMapping, PCFSoftShadowMap, ShadowMapType, ToneMapping } from "three";
// @ts-ignore
import { nodeFrame } from 'three/examples/jsm/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { OculusHandModel } from 'three/examples/jsm/webxr/OculusHandModel.js';
// import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { PhysicalScene } from "./extends/three/scene";
import { LoadingScene } from "./loading";
import { ObjectLoader } from "./loader";
import { emptyObject } from "./extends/three/utils";
import { clone } from "./clone";
import { logger } from "./extends/helper/logger";
import worldGlobal, { MaxGPUComputeWidth, MaxGPUComputeHeight } from "./extends/three/worldGlobal";
import { BodyType, Entity } from "./extends/three/entity";

declare global {
  interface Window {
    world: U3JsRuntime;
  }
}

export interface WorldSettings {
  // screen: 
  resolution: 'auto' | string;
  // render:
  toneMapping?: ToneMapping;
  toneMappingExposure?: number;
  shadowMap?: {
    enabled: boolean;
    type: ShadowMapType;
  };
  vrEnable: boolean;
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

export class U3JsRuntime extends THREE.EventDispatcher {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly clock: THREE.Clock;
  public readonly size: { width: number; height: number } = { width: 2048, height: 2048 };
  public readonly uuid = THREE.MathUtils.generateUUID();

  protected defaultScene: PhysicalScene = new LoadingScene();
  protected currentScene: PhysicalScene;
  protected currentCamera: THREE.Camera;
  protected defaultCamera: THREE.PerspectiveCamera;

  // vr
  protected vrSession?: XRSession;
  /** left, right */
  protected hands: [OculusHandModel?, OculusHandModel?] = [];
  protected handsConllisionMap = new Set<string>();

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

    this.resize(this.size.width, this.size.height, 1);
  }

  resize(width: number, height: number, pixelRatio: number) {
    if (!this.context) {
      return;
    }

    const ratioScale = Math.max(pixelRatio, 1);
    const aspect = width / height;

    this.size.width = width * ratioScale;
    this.size.height = height * ratioScale;

    this.renderer.setSize(this.size.width, this.size.height, false);

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

    if (this.settings.vrEnable) {
      if (!this.currentScene.getObjectByName('vr-controller0')) {
        this.setupVr(scene);
      }
      if (!this.vrSession) {
        this.startVR();
      }
    }
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
    const { project } = json;
    if (project.world) {
      emptyObject(this.settings);
      Object.assign(this.settings, { ...defaultWorldSetting, ...project.world });
    }
    if (!this.settings.resolution) {
      this.settings.resolution = 'auto';
    }
    if (this.settings.vrEnable) {
      this.renderer.xr.enabled = true;
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

  private setupVr(scene: THREE.Scene) {
    const controller0 = this.renderer.xr.getController(0);
    controller0.name = 'vr-controller0';
    scene.add(controller0);

    const controller1 = this.renderer.xr.getController(1);
    scene.add(controller1);

    const controllerModelFactory = new XRControllerModelFactory();
    // const handModelFactory = new XRHandModelFactory();

    // Hand 1
    const controllerGrip10 = this.renderer.xr.getControllerGrip(0);
    controllerGrip10.add(controllerModelFactory.createControllerModel(controllerGrip10));
    scene.add(controllerGrip10);

    const hand0 = this.renderer.xr.getHand(0);
    if (!this.hands[0]) {
      this.hands[0] = new OculusHandModel(hand0);
      this.hands[0].name = 'left';
    }
    hand0.add(this.hands[0]);
    // hand0.add(handModelFactory.createHandModel(hand0));

    scene.add(hand0);

    // Hand 2
    const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const hand1 = this.renderer.xr.getHand(1);
    if (!this.hands[1]) {
      this.hands[1] = new OculusHandModel(hand1);
      this.hands[1].name = 'right';
    }
    hand1.add(this.hands[1]);
    // hand1.add(handModelFactory.createHandModel(hand1));
    scene.add(hand1);
  }

  protected async startVR(): Promise<boolean> {
    if (!navigator.xr) {
      logger.error(`Your browser is not currently supported VR!`);
      return false;
    }
    const supported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!supported) {
      logger.error(`Your browser is not currently supported VR!`);
      return false;
    }

    if (this.vrSession) {
      logger.warn(`VR has already been started!`);
      return false;
    }

    let resolve: any;

    const promise = new Promise<boolean>((r) => resolve = r);

    // WebXR's requestReferenceSpace only works if the corresponding feature
    // was requested at session creation time. For simplicity, just ask for
    // the interesting ones as optional features, but be aware that the
    // requestReferenceSpace call will fail if it turns out to be unavailable.
    // ('local' is always available for immersive sessions and doesn't need to
    // be requested separately.)

    const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] };
    this.vrSession = await navigator.xr.requestSession('immersive-vr', sessionInit);
    await this.renderer.xr.setSession(this.vrSession);
    const onSessionEnded = () => {
      if (this.vrSession) {
        this.vrSession.removeEventListener('end', onSessionEnded);
        this.vrSession = null as any;
        this.currentCamera = this.defaultCamera;
        logger.debug(`VR has been exited successfully!`);
      }
      resolve(true);
    };
    this.vrSession.addEventListener('end', onSessionEnded);

    this.currentCamera = this.defaultCamera;

    return promise;
  }

  protected stopVR() {
    if (this.vrSession) {
      this.vrSession.end();
    }
  }

  protected updateVR() {
    this.renderer.xr.updateCamera(this.currentCamera as any);
    for (const hand of this.hands) {
      if (!hand) continue;
      for (const it of this.currentScene.children as Entity[]) {
        if (it.bodyType === BodyType.Ghost) {
          continue;
        }
        const key = `${hand.name}:${it.uuid}`;
        if (hand.intersectBoxObject(it)) {
          if (!this.handsConllisionMap.has(key)) {
            this.handsConllisionMap.add(key);
            it.dispatchEvent({ type: 'onCollisionEnter', target: hand } as any);
          }
        } else if (this.handsConllisionMap.has(key)) {
          this.handsConllisionMap.delete(key);
          it.dispatchEvent({ type: 'onCollisionLeave', target: hand } as any);
        }
      }
    }
  }

  private render(delta: number, now: number) {
    worldGlobal.delta = delta;
    worldGlobal.now = now;
    this.currentScene.update(this.renderer, this.currentCamera, delta, now);
    nodeFrame.update();
    if (this.renderer.xr.enabled) {
      this.updateVR();
    }
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