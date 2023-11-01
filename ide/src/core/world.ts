/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three';
import { Camera, Clock, EventDispatcher, PerspectiveCamera, OrthographicCamera } from "three";
import { nodeFrame, WebGPU, WebGPURenderer } from 'u3js/src/libs/three/examples';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { OculusHandModel } from 'three/examples/jsm/webxr/OculusHandModel';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { PhysicalScene } from 'u3js/src/extends/three/scene';
import type { HistoryManager, UserEventMap } from 'u3js/src/types/types';
import worldGlobal, { MaxGPUComputeWidth, MaxGPUComputeHeight } from 'u3js/src/extends/three/worldGlobal';
import { logger } from 'u3js/src/extends/helper/logger';
import { WorldSettings } from 'u3js/src/runtime';
import { BodyType, Entity } from 'u3js/src/extends/three/entity';
import { WorldEditor } from './editors/world';
import { Sculptor } from './editors/sculptor';

const stats = new Stats();
stats.dom.style.top = 'unset';
stats.dom.style.bottom = '0';
document.body.appendChild(stats.dom);

export type WorldEvent = 'worldStarted' | 'worldSettingsModified' | 'objectChanged' | 'objectModified';
export type WorldEventMap = {
  worldStarted: { type: WorldEvent; soure: EventDispatcher; world: World };
  worldSettingsModified: { type: WorldEvent; soure: EventDispatcher; settings: Partial<WorldSettings> };
  objectChanged: { type: WorldEvent; soure: EventDispatcher; object: THREE.Object3D | undefined };
  objectModified: { type: WorldEvent; soure: EventDispatcher; objects: THREE.Object3D[]; };
};

const useGPU = false;

export class World extends EventDispatcher<WorldEventMap & UserEventMap> {
  public readonly rendererGL?: THREE.WebGLRenderer;
  public readonly rendererGPU?: THREE.WebGLRenderer;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly clock: THREE.Clock;
  public readonly size: { width: number; height: number } = { width: 640, height: 480 };
  public readonly uuid = THREE.MathUtils.generateUUID();

  public readonly root: WorldEditor;
  public readonly sculptor: Sculptor;
  private sculptorResolve: any;

  protected currentCamera: Camera;

  public cameraPersp: PerspectiveCamera;
  public cameraOrtho: OrthographicCamera;
  public cameraPerspVR: PerspectiveCamera;

  public selectedObjects: Array<THREE.Object3D> = [];

  // vr
  protected vrSession?: XRSession;
  /** left, right */
  protected hands: [OculusHandModel?, OculusHandModel?] = [];
  protected handsConllisionMap = new Set<string>();

  // helpers
  public readonly gridHelper: THREE.GridHelper;
  protected viewHelper: ViewHelper;
  protected cameraHelper: THREE.CameraHelper;
  protected lightHelper: THREE.PointLightHelper | THREE.SpotLightHelper | THREE.DirectionalLightHelper | THREE.HemisphereLightHelper | null = null;

  protected working = false;

  constructor(public readonly context: HTMLCanvasElement, public readonly history: HistoryManager) {
    super();

    // clock
    this.clock = new Clock();

    // renderer
    if (useGPU && WebGPU.isAvailable()) {
      this.rendererGPU = new WebGPURenderer({
        canvas: this.context,
        context: this.context.getContext('webgpu'),
        antialias: true,
      }) as THREE.WebGLRenderer;
    } else {
      this.rendererGL = new THREE.WebGLRenderer({
        canvas: this.context,
        antialias: true,
      }) as THREE.WebGLRenderer;
    }

    this.renderer = this.rendererGPU || this.rendererGL as any;

    this.renderer.xr.enabled = true;

    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.useLegacyLights = false;
    this.renderer.setClearColor(0xffffff);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(2048, 2048, false);

    worldGlobal.gpuComputeRender = new GPUComputationRenderer(MaxGPUComputeWidth, MaxGPUComputeHeight, this.renderer);

    // camera
    this.cameraPersp = new PerspectiveCamera(50, 1, 0.001, 1000);
    this.cameraPersp.name = 'Perspective';
    this.cameraPersp.position.set(0, 3, 12);
    this.cameraPersp.lookAt(0, 0, 0);

    this.cameraOrtho = new OrthographicCamera(- 3, 3, 3, - 3, 0.01, 30000);
    this.cameraOrtho.name = 'Orthographic';
    this.cameraOrtho.position.set(0, 0, 100);

    this.cameraPerspVR = new PerspectiveCamera(50, 1, 0.001, 1000);
    this.cameraPerspVR.name = 'PerspectiveVr';
    this.cameraPerspVR.position.set(0, 3, 12);
    this.cameraPerspVR.lookAt(0, 0, 0);

    // scene
    this.root = new WorldEditor(this.renderer, this.size, this.cameraPersp, this.selectedObjects, history, this);
    this.root.actived = true;

    this.root.add(this.cameraOrtho);
    this.root.add(this.cameraPersp);
    this.root.add(this.cameraPerspVR);

    this.currentCamera = this.cameraPersp;

    // sculptor
    this.sculptor = new Sculptor(this.renderer, this.size, history, this);
    this.sculptor.actived = false;

    // vr
    this.setupVr(this.root);

    // helper
    const gridHelper = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
    gridHelper.visible = !!JSON.parse(localStorage.getItem('isGridHelperVisible') || '1');
    this.gridHelper = gridHelper;
    this.root.add(this.gridHelper);

    this.cameraHelper = new THREE.CameraHelper(this.currentCamera);
    this.cameraHelper.visible = false;
    this.root.add(this.cameraHelper);

    this.viewHelper = new ViewHelper(this.currentCamera, this.renderer.domElement);
  }
  resize(width: number, height: number, pixelRatio?: number) {
    if (!this.context) {
      return;
    }

    const ratioScale = (pixelRatio ? Math.max(pixelRatio, 1) : 1);
    const aspect = width / height;

    this.size.width = width * ratioScale;
    this.size.height = height * ratioScale;

    this.renderer.setSize(this.size.width, this.size.height, false);

    this.root.resize();

    this.cameraPersp.aspect = aspect;
    this.cameraPersp.updateProjectionMatrix();

    this.cameraOrtho.top = this.cameraOrtho.right / aspect;
    this.cameraOrtho.bottom = -this.cameraOrtho.top;
    this.cameraOrtho.updateProjectionMatrix();

    if (this.currentCamera.parent !== this.root) {
      if (this.currentCamera instanceof PerspectiveCamera) {
        this.currentCamera.aspect = aspect;
        this.currentCamera.updateProjectionMatrix();
      }
    }
  }

  updateSettings(settings: Partial<Omit<WorldSettings, 'width' | 'height'>>) {
    const target: any = this.renderer;
    for (const [k, v] of Object.entries(settings)) {
      if (k === 'shadowMap') {
        target.shadowMap[k].enabled = (v as any).enabled;
        target.shadowMap[k].type = (v as any).type;
      } else {
        target[k] = v;
      }
    }
  }

  setCamera(camera: Camera) {
    if (this.currentCamera === camera) {
      return;
    }

    this.currentCamera = camera;
    this.root.setCamera(camera);

    if (this.currentCamera.parent !== this.root) {
      if (this.currentCamera instanceof PerspectiveCamera) {
        this.currentCamera.aspect = this.size.width / this.size.height;
        this.currentCamera.updateProjectionMatrix();
      }
    }
  }

  reposCamera() {
    this.currentCamera.position.set(0, 3, 8);
    this.currentCamera.rotation.set(0, 0, 0);
    this.currentCamera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  setScene(scene: PhysicalScene) {
    this.root.setScene(scene);
  }

  selectObject(object?: THREE.Object3D, force?: boolean) {
    return this.root.selectObject(object, force);
  }

  get selected(): THREE.Object3D | undefined {
    return this.root.selected;
  }

  setSelectedObjects(ar: Array<THREE.Object3D>) {
    this.selectedObjects = ar;
    return this.root.setSelectedObjects(ar);
  }

  async openSculptor(mesh: THREE.Mesh) {
    if (this.sculptorResolve) {
      return;
    }
    this.sculptor.object = mesh;
    this.sculptor.actived = true;
    this.root.actived = false;
    return new Promise((resolve) => this.sculptorResolve = resolve).finally(() => {
      this.sculptor.actived = false;
      this.root.actived = true;
    });
  }

  closeSculptor() {
    if (this.sculptorResolve) {
      this.sculptorResolve();
      this.sculptorResolve = undefined;
    }
  }

  private render(delta: number, now: number) {
    worldGlobal.delta = delta;
    worldGlobal.now = now;
    if (this.vrSession) {
      this.updateVR();
    }
    nodeFrame.update();
    this.renderer.autoClear = true;
    if ((this.renderer as any).isWebGPURenderer) {
      this.renderer.render(this.root, this.currentCamera);
    } else if (this.vrSession) {
      this.renderer.render(this.root, this.currentCamera);
    } else if (this.sculptor.actived) {
      this.sculptor.render(delta, now);
    } else {
      this.root.render(delta, now);
      // this.composer.render(delta);
    }
    this.renderer.autoClear = false;
    this.viewHelper.render(this.renderer);
  }

  async run(): Promise<void> {
    if (this.working) {
      throw new Error('already working');
    }
    console.log(`world start`);

    this.dispatchEvent({ type: 'worldStarted', soure: this, world: this });

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
      const t0 = Date.now();
      this.render(delta, now);
      const t2 = Date.now();
      if ((t2 - t0) >= 100) {
        console.warn(`render take ${t2 - t0} ms`);
      }
      stats.update();
    };
    this.renderer.setAnimationLoop(step);
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

  async startVR(): Promise<boolean> {
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
        this.currentCamera = this.cameraPersp;
        logger.debug(`VR has been exited successfully!`);
      }
      resolve(true);
    };
    this.vrSession.addEventListener('end', onSessionEnded);

    this.currentCamera = this.cameraPerspVR;

    return promise;
  }

  stopVR() {
    if (this.vrSession) {
      this.vrSession.end();
    }
  }

  isRunningVR() {
    return this.vrSession ? true : false;
  }

  protected updateVR() {
    this.renderer.xr.updateCamera(this.currentCamera as any);
    if (!this.root.currentScene) {
      return;
    }
    for (const hand of this.hands) {
      if (!hand) continue;
      for (const it of this.root.currentScene.children as Entity[]) {
        if (it.bodyType === BodyType.Ghost) {
          continue;
        }
        const key = `${hand.name}:${it.uuid}`;
        if (hand.intersectBoxObject(it)) {
          this.handsConllisionMap.add(key);
          it.dispatchEvent({ type: 'onCollisionEnter', target: hand } as any);
        } else if (this.handsConllisionMap.has(key)) {
          this.handsConllisionMap.delete(key);
          it.dispatchEvent({ type: 'onCollisionLeave', target: hand } as any);
        }
      }
    }
  }

  dispose(): void {
    this.root.dispose();
    this.sculptor.dispose();
    this.viewHelper.dispose();
    this.clock.stop();
    this.renderer.dispose();
  }
}