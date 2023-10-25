/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three';
import { Camera, Clock, EventDispatcher, PerspectiveCamera, OrthographicCamera, Scene, ShadowMapType, ToneMapping, Raycaster, Material } from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { nodeFrame, WebGPU, WebGPURenderer, OutlinePass } from 'u3js/src/libs/three/examples';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { PhysicalScene } from 'u3js/src/extends/three/scene';
import type { HistoryManager, UserEventMap } from 'u3js/src/types/types';
import worldGlobal, { MaxGPUComputeWidth, MaxGPUComputeHeight } from 'u3js/src/extends/three/worldGlobal';

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
}

const useGPU = false;

export class World extends EventDispatcher<WorldEventMap & UserEventMap> {
  public readonly rendererGL?: THREE.WebGLRenderer;
  public readonly rendererGPU?: THREE.WebGLRenderer;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly clock: THREE.Clock;
  public readonly size: { width: number; height: number } = { width: 640, height: 480 };
  public readonly uuid = THREE.MathUtils.generateUUID();

  public readonly root: Scene;
  protected currentScene?: PhysicalScene;
  protected currentCamera: Camera;

  public cameraPersp: PerspectiveCamera;
  public cameraOrtho: OrthographicCamera;
  public cameraPerspVR: PerspectiveCamera;

  public selectedObjects: Array<THREE.Object3D> = [];
  public multiSelectEnable = false;

  // post processing
  public readonly composer: EffectComposer;
  protected renderPass: RenderPass;
  protected outlinePass: OutlinePass;
  protected outputPass: OutputPass;
  protected effectFXAA: ShaderPass;

  protected orbit: OrbitControls;
  protected controls: TransformControls;
  private beforeTransformedObject?: THREE.Object3D;
  private beforeTransformed = new THREE.Object3D();

  // vr
  protected vrSession?: XRSession;

  // helpers
  public readonly gridHelper: THREE.GridHelper;
  protected viewHelper: ViewHelper;
  protected cameraHelper: THREE.CameraHelper;
  protected lightHelper: THREE.PointLightHelper | THREE.SpotLightHelper | THREE.DirectionalLightHelper | THREE.HemisphereLightHelper | null = null;

  protected raycaster: Raycaster;
  private fnPointerDown: any;
  private fnPointerUp: any;
  private positionDown = new THREE.Vector2();

  protected working = false;

  private keydownListener: any;
  private keyupListener: any;

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

    // scene
    this.root = new Scene();

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

    this.root.add(this.cameraOrtho);
    this.root.add(this.cameraPersp);
    this.root.add(this.cameraPerspVR);

    this.currentCamera = this.cameraPersp;

    // composer
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.root, this.currentCamera);
    this.composer.addPass(this.renderPass);
    this.outlinePass = new OutlinePass(new THREE.Vector2(this.size.width, this.size.height), this.root, this.currentCamera);
    this.outlinePass.resolution = new THREE.Vector2(this.size.width, this.size.height);
    this.outlinePass.edgeStrength = 25;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.pulsePeriod = 3;
    this.outlinePass.edgeThickness = 1;
    this.outlinePass.usePatternTexture = false;
    this.composer.addPass(this.outlinePass);
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.uniforms['resolution'].value.set(1 / this.size.width, 1 / this.size.height);
    this.composer.addPass(this.effectFXAA);

    // controls
    const orbit = new OrbitControls(this.currentCamera, this.renderer.domElement);
    orbit.minDistance = 1;
    orbit.maxDistance = 100;
    orbit.update();
    this.orbit = orbit;

    const control = new TransformControls(this.currentCamera, this.renderer.domElement);
    control.addEventListener('dragging-changed', function (event) {
      orbit.enabled = !event.value;
    });
    control.traverse(e => e.castShadow = false);
    this.controls = control;
    this.root.add(this.controls);

    // helper
    const gridHelper = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
    gridHelper.visible = !!JSON.parse(localStorage.getItem('isGridHelperVisible') || '1');
    this.gridHelper = gridHelper;
    this.root.add(this.gridHelper);

    this.cameraHelper = new THREE.CameraHelper(this.currentCamera);
    this.cameraHelper.visible = false;
    this.root.add(this.cameraHelper);

    this.viewHelper = new ViewHelper(this.currentCamera, this.renderer.domElement);

    // raycaster
    this.raycaster = new Raycaster();
    this.fnPointerDown = (e: PointerEvent) => {
      this.onPointerDown(e);
    };
    this.fnPointerUp = (e: PointerEvent) => {
      this.onPointerUp(e);
    };
    this.context.addEventListener('pointerdown', this.fnPointerDown);
    this.context.addEventListener('pointerup', this.fnPointerUp);

    this.keydownListener = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case 81: // Q
          control.setSpace(control.space === 'local' ? 'world' : 'local');
          break;

        case 87: // W
          control.setMode('translate');
          break;

        case 69: // E
          control.setMode('rotate');
          break;

        case 82: // R
          control.setMode('scale');
          break;

        case 88: // X
          control.showX = !control.showX;
          break;

        case 89: // Y
          control.showY = !control.showY;
          break;

        case 90: // Z
          control.showZ = !control.showZ;
          break;

        case 32: // Spacebar
          control.enabled = !control.enabled;
          break;

        case 16: // Shift
          this.multiSelectEnable = true;
          break;
      }
    };

    this.keyupListener = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case 16: // Shift
          this.multiSelectEnable = false;
          break;
      }
    };
  }
  resize(width: number, height: number, pixelRatio?: number) {
    if (!this.context) {
      return;
    }

    const ratioScale = (pixelRatio ? Math.max(pixelRatio, 1) : 1);
    const aspect = width / height;

    this.size.width = width * ratioScale;
    this.size.height = height * ratioScale;

    // this.context.width = this.size.width;
    // this.context.height = this.size.height;
    this.renderer.setSize(this.size.width, this.size.height, false);
    // this.renderer.setScissor(0, 0, this.size.width, this.size.height);

    this.outlinePass.resolution = new THREE.Vector2(this.size.width, this.size.height);
    this.outlinePass.setSize(this.size.width, this.size.height);
    this.outlinePass.selectedObjects = this.selectedObjects;
    this.effectFXAA.uniforms['resolution'].value.set(1 / this.size.width, 1 / this.size.height);

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
    this.orbit.saveState();
    this.orbit.object = camera;
    this.orbit.reset();
    this.controls.camera = camera;

    if (this.currentCamera.parent !== this.root) {
      if (this.currentCamera instanceof PerspectiveCamera) {
        this.currentCamera.aspect = this.size.width / this.size.height;
        this.currentCamera.updateProjectionMatrix();
      }
    }

    this.renderPass.camera = this.currentCamera;
    this.outlinePass.renderCamera = this.currentCamera;
  }

  reposCamera() {
    this.currentCamera.position.set(0, 3, 8);
    this.currentCamera.rotation.set(0, 0, 0);
    this.currentCamera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  setScene(scene: PhysicalScene) {
    if (this.currentScene === scene) {
      return;
    }

    if (this.currentScene) {
      this.root.remove(this.currentScene);

      // do not fire any event in editor mode
      this.currentScene.deactive();
    }

    this.controls.detach();

    this.currentScene = scene;
    this.root.background = scene.background;
    this.root.environment = scene.environment;
    this.root.add(this.currentScene);
    // do not fire any event in editor mode
    this.recompileMaterials();
    this.currentScene.active();
  }

  selectObject(object?: THREE.Object3D, force?: boolean) {
    if (!force && object === this.controls.object) {
      return;
    }
    if (this.controls.object) {
      this.controls.detach();
      window.removeEventListener('keydown', this.keydownListener);
      window.removeEventListener('keyup', this.keyupListener);
    }
    if (!this.multiSelectEnable) {
      this.selectedObjects.length = 0;
    }
    if (this.lightHelper) {
      this.lightHelper.removeFromParent();
      const help = this.lightHelper;
      setTimeout(() => {
        help.dispose();
      });
      this.lightHelper = null;
    }
    this.cameraHelper.visible = false;
    if (object) {
      if (object instanceof THREE.Camera) {
        this.cameraHelper.visible = true;
        this.cameraHelper.camera = object;
        this.cameraHelper.matrix = object.matrixWorld;
        this.cameraHelper.update();
        this.cameraHelper.visible = true;
      } else if (object instanceof THREE.PointLight) {
        this.lightHelper = new THREE.PointLightHelper(object);
        this.root.add(this.lightHelper);
      } else if (object instanceof THREE.SpotLight) {
        this.lightHelper = new THREE.SpotLightHelper(object);
        this.root.add(this.lightHelper);
      } else if (object instanceof THREE.DirectionalLight) {
        this.lightHelper = new THREE.DirectionalLightHelper(object);
        this.root.add(this.lightHelper);
      } else if (object instanceof THREE.HemisphereLight) {
        this.lightHelper = new THREE.HemisphereLightHelper(object, 10);
        this.root.add(this.lightHelper);
      }
      this.controls.attach(object);
      if (this.selectedObjects.indexOf(object) === -1) {
        this.selectedObjects.push(object);
      }
      window.addEventListener('keydown', this.keydownListener);
      window.addEventListener('keyup', this.keyupListener);
    }

    this.dispatchEvent({ type: 'objectChanged', soure: this, object });
  }

  get selected(): THREE.Object3D | undefined {
    return this.controls.object;
  }

  private render(delta: number, now: number) {
    worldGlobal.delta = delta;
    worldGlobal.now = now;
    if (this.currentScene) {
      this.currentScene.update(this.renderer, this.currentCamera, delta, now, true);
    }
    if (this.vrSession) {
      this.renderer.xr.updateCamera(this.currentCamera as any);
    }
    nodeFrame.update();
    this.renderer.autoClear = true;
    if ((this.renderer as any).isWebGPURenderer) {
      this.renderer.render(this.root, this.currentCamera);
    } else if (this.vrSession) {
      this.renderer.render(this.root, this.currentCamera);
    } else {
      this.composer.render(delta);
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

  private onPointerDown(e: PointerEvent) {
    if (!this.currentScene) {
      return;
    }
    if (this.controls.object) {
      this.beforeTransformedObject = this.controls.object;
      this.beforeTransformed.position.copy(this.controls.object.position);
      this.beforeTransformed.scale.copy(this.controls.object.scale);
      this.beforeTransformed.rotation.copy(this.controls.object.rotation);
    }
    const { left, top, width, height } = this.context.getBoundingClientRect();
    this.positionDown.set((e.clientX - left) / width * 2 - 1, - (e.clientY - top) / height * 2 + 1);
  }

  private onPointerUp(e: PointerEvent) {
    if (!this.currentScene) {
      return;
    }
    if (this.beforeTransformedObject && this.controls.object === this.beforeTransformedObject) {
      const object = this.controls.object;
      const positionOld = this.beforeTransformed.position.clone();
      const scaleOld = this.beforeTransformed.scale.clone();
      const rotationOld = this.beforeTransformed.rotation.clone();
      const position = this.controls.object.position.clone();
      const scale = this.controls.object.scale.clone();
      const rotation = this.controls.object.rotation.clone();
      const isEquals = positionOld.equals(position) && scaleOld.equals(scale) && rotationOld.equals(rotation);
      if (!isEquals) {
        this.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.controls.object] });
        this.history.push({
          tip: 'Object changed!',
          undo: () => {
            object.position.copy(positionOld);
            object.scale.copy(scaleOld);
            object.rotation.copy(rotationOld);
          },
          redo: () => {
            object.position.copy(position);
            object.scale.copy(scale);
            object.rotation.copy(rotation);
          },
        })
      }
    }
    const { left, top, width, height } = this.context.getBoundingClientRect();
    const pointer = new THREE.Vector2((e.clientX - left) / width * 2 - 1, - (e.clientY - top) / height * 2 + 1);
    if (!pointer.equals(this.positionDown)) {
      return;
    }
    this.raycaster.setFromCamera(pointer, this.currentCamera);
    const intersects = this.raycaster.intersectObjects(this.currentScene.children, false);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (this.controls.object !== object) {
        this.selectObject(object, true);
      }
    }
  }

  private recompileMaterials() {
    if (!this.currentScene) {
      return;
    }
    this.currentScene.traverse(child => {
      if ((child as any).material instanceof Material) {
        (child as any).material.needsUpdate = true;
      } else if (Array.isArray((child as any).material)) {
        for (const m of (child as any).material) {
          (m as any).material.needsUpdate = true;
        }
      }
    });
  }

  async startVR(): Promise<boolean> {
    if (!navigator.xr) {
      return false;
    }
    const supported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!supported) {
      return false;
    }

    if (this.vrSession) {
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

  dispose(): void {
    this.context.removeEventListener('pointerdown', this.fnPointerDown);
    this.context.removeEventListener('pointerup', this.fnPointerUp);
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);

    this.viewHelper.dispose();

    // post processing
    this.composer.dispose();
    if (this.renderPass) {
      this.renderPass.dispose();
    }
    if (this.outlinePass) {
      this.outlinePass.dispose();
    }
    this.outputPass.dispose();
    this.effectFXAA.dispose();

    this.clock.stop();
    this.renderer.dispose();
  }
}