import { Camera, Color, EventDispatcher, MOUSE, Material, Object3D, Raycaster, Scene, TOUCH, Vector2, WebGLRenderer } from "three";
import type { HistoryManager, } from 'u3js/src/types/types';
import { SceneEditorEventMap } from "./event";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { PhysicalScene } from "u3js/src/extends/three/scene";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

export class WorldEditor extends Scene {
  private _actived = false;

  public currentScene?: Scene;

  private multiSelectEnable = false;

  // post processing
  public readonly composer: EffectComposer;
  protected renderPass: RenderPass;
  protected outlinePass: OutlinePass;
  protected outputPass: OutputPass;
  protected effectFXAA: ShaderPass;

  public readonly orbit: OrbitControls;
  protected controls: TransformControls;

  private beforeTransformedObject?: Object3D;
  private beforeTransformed = new Object3D();

  private raycaster: Raycaster;
  private fnPointerDown: any;
  private fnPointerUp: any;
  private positionDown = new Vector2();
  private keydownListener: any;
  private keyupListener: any;

  constructor(
    public readonly renderer: WebGLRenderer,
    public readonly size: { width: number; height: number },
    private camera: Camera,
    private selectedObjects: Array<Object3D>,
    public readonly history: HistoryManager,
    public readonly dispatcher: EventDispatcher<SceneEditorEventMap>
  ) {
    super();

    // composer
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this, this.camera);
    this.composer.addPass(this.renderPass);
    this.outlinePass = new OutlinePass(new Vector2(this.size.width, this.size.height), this, this.camera);
    this.outlinePass.resolution = new Vector2(this.size.width, this.size.height);
    this.outlinePass.visibleEdgeColor = new Color(0x88ff88);
    this.outlinePass.edgeStrength = 8;
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
    const orbit = new OrbitControls(this.camera, this.renderer.domElement);
    orbit.minDistance = 0.1;
    orbit.maxDistance = 100;
    orbit.touches.ONE = TOUCH.PAN;
    orbit.mouseButtons.LEFT = MOUSE.PAN;
    orbit.touches.TWO = TOUCH.ROTATE;
    orbit.mouseButtons.RIGHT = MOUSE.ROTATE;
    orbit.update();
    this.orbit = orbit;

    const control = new TransformControls(this.camera, this.renderer.domElement);
    control.addEventListener('dragging-changed', function (event) {
      orbit.enabled = !event.value;
    });
    control.traverse(e => e.castShadow = false);
    this.controls = control;
    this.add(this.controls);

    // raycaster
    this.raycaster = new Raycaster();
    this.fnPointerDown = (e: PointerEvent) => {
      this.onPointerDown(e);
    };
    this.fnPointerUp = (e: PointerEvent) => {
      this.onPointerUp(e);
    };
    this.renderer.domElement.addEventListener('pointerdown', this.fnPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.fnPointerUp);

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

  get actived() {
    return this._actived;
  }
  set actived(val: boolean) {
    this._actived = val;
    this.controls.enabled = val;
    this.orbit.enabled = val;
  }

  // size has been updated outside
  resize() {
    this.outlinePass.resolution = new Vector2(this.size.width, this.size.height);
    this.outlinePass.setSize(this.size.width, this.size.height);
    this.outlinePass.selectedObjects = this.selectedObjects;
    this.effectFXAA.uniforms['resolution'].value.set(1 / this.size.width, 1 / this.size.height);
  }

  render(delta: number, now: number) {
    if (this.currentScene && this.currentScene instanceof PhysicalScene) {
      this.currentScene.update(this.renderer, this.camera, delta, now, true);
    }
    this.composer.render(delta);
  }

  setCamera(camera: Camera) {
    this.camera = camera;

    this.orbit.saveState();
    this.orbit.object = camera;
    this.orbit.reset();
    this.controls.camera = camera;

    this.renderPass.camera = this.camera;
    this.outlinePass.renderCamera = this.camera;
  }

  setScene(scene: Scene) {
    if (this.currentScene === scene) {
      return;
    }

    if (this.currentScene) {
      this.remove(this.currentScene);
      if (this.currentScene instanceof PhysicalScene) {
        this.currentScene.deactive();
      }
    }

    this.controls.detach();

    this.currentScene = scene;
    this.background = scene.background;
    this.environment = scene.environment;
    this.add(this.currentScene);

    this.recompileMaterials();
    if (this.currentScene instanceof PhysicalScene) {
      this.currentScene.active();
    }
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
    if (object) {
      this.controls.attach(object);
      if (this.selectedObjects.indexOf(object) === -1) {
        this.selectedObjects.push(object);
      }
      window.addEventListener('keydown', this.keydownListener);
      window.addEventListener('keyup', this.keyupListener);
    }

    this.dispatcher.dispatchEvent({ type: 'objectChanged', soure: this, object });
  }
  get selected(): THREE.Object3D | undefined {
    return this.controls.object;
  }

  setSelectedObjects(ar: Array<Object3D>) {
    this.selectedObjects = ar;
  }

  dispose(): void {
    this.renderer.domElement.removeEventListener('pointerdown', this.fnPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.fnPointerUp);
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);

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
  }

  private onPointerDown(e: PointerEvent) {
    if (!this._actived || !this.currentScene) {
      return;
    }
    if (this.controls.object) {
      this.beforeTransformedObject = this.controls.object;
      this.beforeTransformed.position.copy(this.controls.object.position);
      this.beforeTransformed.scale.copy(this.controls.object.scale);
      this.beforeTransformed.rotation.copy(this.controls.object.rotation);
    }
    const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
    this.positionDown.set((e.clientX - left) / width * 2 - 1, - (e.clientY - top) / height * 2 + 1);
  }

  private onPointerUp(e: PointerEvent) {
    if (!this._actived || !this.currentScene) {
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
        this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.controls.object] });
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
    const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
    const pointer = new Vector2((e.clientX - left) / width * 2 - 1, - (e.clientY - top) / height * 2 + 1);
    if (!pointer.equals(this.positionDown)) {
      return;
    }
    this.raycaster.setFromCamera(pointer, this.camera);
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
}