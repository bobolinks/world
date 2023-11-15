/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AmbientLight,
  BufferGeometry, Color, DirectionalLight, EventDispatcher, GridHelper,
  Group, MOUSE, Mesh, MeshBasicMaterial,
  Object3D,
  PerspectiveCamera, Scene, ShadowMaterial, TOUCH, Uint8BufferAttribute, Vector2, Vector3, WebGLRenderer
} from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";
import type { HistoryManager } from "u3js/src/types/types";
import { SceneEditorEventMap } from "./event";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Brush } from "three-bvh-csg";

export class GeometryEditor extends Scene {
  public readonly camera: PerspectiveCamera;
  public currentScene?: Scene;
  public mesh: Mesh;

  protected _object?: Mesh;
  protected _actived = false;
  protected _wireframe = true;
  protected _target?: Object3D;

  protected wireframeMaterial = new MeshBasicMaterial({ wireframe: true });
  protected group: Group;
  protected helper: MeshBVHVisualizer;
  protected orbit: OrbitControls;
  protected controls: TransformControls;
  protected transforming = false;
  protected beforeTransformedObject?: Object3D;
  protected beforeTransformed = new Object3D();

  protected prevPoint = new Vector2();
  protected startPoint = new Vector2();
  protected dragging = false;

  private fnPointerDown: any;
  private fnPointerUp: any;
  private fnPointerMove: any;

  constructor(
    public readonly renderer: WebGLRenderer,
    public readonly size: { width: number; height: number },
    public readonly history: HistoryManager,
    public readonly dispatcher: EventDispatcher<SceneEditorEventMap>
  ) {
    super();

    this.background = new Color(0x263238);

    // camera
    this.camera = new PerspectiveCamera(50, 1, 0.0001, 3000);
    this.camera.name = 'Perspective';
    this.camera.position.set(0, 0, 12);
    this.camera.lookAt(0, 0, 0);

    this.add(this.camera);

    const light = new DirectionalLight(0xffffff, 1);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.position.set(10, 10, 10);
    this.add(light);
    this.add(new AmbientLight(0xb0bec5, 0.8));

    // group for rotation
    this.group = new Group();
    this.add(this.group);

    const mesh = new Brush(undefined, this.wireframeMaterial);
    this.mesh = mesh;
    this.group.add(this.mesh);

    this.helper = new MeshBVHVisualizer(mesh, 10);
    this.helper.visible = false;
    this.group.add(this.helper);

    // add floor
    const gridHelper = new GridHelper(10, 10, 0xffffff, 0xffffff);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    // gridHelper.position.y = - 2.75;
    this.add(gridHelper);

    const shadowPlane = new Mesh(
      new BufferGeometry(),
      new ShadowMaterial({ color: 0, opacity: 0.8, depthWrite: false })
    );
    // shadowPlane.position.y = - 2.74;
    shadowPlane.rotation.x = - Math.PI / 2;
    shadowPlane.scale.setScalar(20);
    shadowPlane.renderOrder = 2;
    shadowPlane.receiveShadow = true;
    this.add(shadowPlane);

    // controls
    const orbit = new OrbitControls(this.camera, renderer.domElement);
    orbit.minDistance = 0.1;
    orbit.maxDistance = 100;
    orbit.touches.ONE = TOUCH.PAN;
    orbit.mouseButtons.LEFT = MOUSE.PAN;
    orbit.touches.TWO = TOUCH.ROTATE;
    orbit.mouseButtons.RIGHT = MOUSE.ROTATE;
    orbit.enablePan = false;
    this.orbit = orbit;

    const control = new TransformControls(this.camera, this.renderer.domElement);
    control.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value;
      this.transforming = !orbit.enabled;
    });
    control.traverse(e => e.castShadow = false);
    this.controls = control;
    this.add(this.controls);

    this.fnPointerDown = (e: PointerEvent) => {
      this.onPointerDown(e);
    };
    this.fnPointerUp = (e: PointerEvent) => {
      this.onPointerUp(e);
    };
    this.fnPointerMove = (e: PointerEvent) => {
      this.onPointerMove(e);
    };
    this.renderer.domElement.addEventListener('pointerdown', this.fnPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.fnPointerUp);
    this.renderer.domElement.addEventListener('pointermove', this.fnPointerMove);
  }

  set object(m: Mesh) {
    this._object = m;

    this.mesh.geometry.dispose();
    this.mesh.geometry = m.geometry;

    this.mesh.geometry.boundsTree = new MeshBVH(this.mesh.geometry);

    this.helper.update();
  }

  get actived() {
    return this._actived;
  }
  set actived(val: boolean) {
    this._actived = val;
    this.orbit.enabled = val;
  }

  get wireframe() {
    return this._wireframe;
  }
  set wireframe(val: boolean) {
    if (this._wireframe === val) {
      return;
    }
    this._wireframe = val;
    if (this._object) {
      this.mesh.material = val ? this.wireframeMaterial : this._object.material;
    }
    this.updateScene();
  }

  get showHelper() {
    return this.helper.visible;
  }
  set showHelper(val: boolean) {
    this.helper.visible = val;
  }

  setScene(scene: Scene) {
    let target = scene.getObjectByName('[target]');
    if (!target) {
      target = new Object3D();
      target.name = '[target]';
      scene.add(target);
    }
    this._target = target;
    this.currentScene = scene;
    this.add(scene);
    this.updateScene();
  }

  private updateScene() {
    if (!this.currentScene) {
      return;
    }
    for (const child of this.currentScene.children) {
      if (!(child instanceof Mesh)) {
        continue;
      }
      child.material.wireframe = this._wireframe;
    }
  }

  selectObject(object?: THREE.Object3D, force?: boolean) {
    if (!force && object === this.controls.object) {
      return;
    }
    if (object && object instanceof Scene) {
      return;
    }
    if (this.controls.object) {
      this.controls.detach();
    }
    if (object) {
      this.controls.attach(object);
    }
    this.dispatcher.dispatchEvent({ type: 'objectChanged', soure: this, object });
  }
  get selected(): THREE.Object3D | undefined {
    return this.controls.object;
  }

  render(delta: number, now: number) {
    this.renderer.render(this, this.camera);
  }

  dispose(): void {
    this.renderer.domElement.removeEventListener('pointerdown', this.fnPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.fnPointerUp);
    this.renderer.domElement.removeEventListener('pointermove', this.fnPointerMove);
  }

  protected onPointerDown(e: PointerEvent) {
    if (!this._actived) {
      return false;
    } else if (this.transforming) {
      if (this.controls.object) {
        this.beforeTransformedObject = this.controls.object;
        this.beforeTransformed.position.copy(this.controls.object.position);
      }
    } else {
      const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();

      this.prevPoint.x = e.clientX;
      this.prevPoint.y = e.clientY;
      this.startPoint.x = ((e.clientX - left) / width) * 2 - 1;
      this.startPoint.y = - (((e.clientY - top) / height) * 2 - 1);
      this.dragging = true;
    }
    return true;
  }
  protected onPointerUp(e: PointerEvent) {
    if (!this._actived) {
      return false;
    } else if (this.beforeTransformedObject) {
      if (this.controls.object === this.beforeTransformedObject) {
        const positionOld = this.beforeTransformed.position.clone();
        const position = this.controls.object.position.clone();
        const isEquals = positionOld.equals(position);
        if (!isEquals) {
          const delta = position.sub(positionOld);
          // this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.controls.object] });
          if (this.beforeTransformedObject === this._target) {
            this.onTargetMove(delta);
            this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.controls.object] });
          } else {
            // do nothings
          }
        }
      }
      this.beforeTransformedObject = undefined;
    } else {
      this.dragging = false;
    }
    return true;
  }
  protected onPointerMove(e: PointerEvent) {
    // do nothings
  }

  protected onTargetMove(delta: Vector3) {
    // do nothings
  }
}
