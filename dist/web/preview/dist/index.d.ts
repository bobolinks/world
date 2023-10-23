/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-len */
import { AnimationAction } from 'three';
import { AnimationClip } from 'three';
import { AnimationMixer } from 'three';
import { AudioListener } from 'three';
import { BoxGeometry } from 'three';
import { BufferGeometry } from 'three';
import { Camera } from 'three';
import { CapsuleGeometry } from 'three';
import { Color } from 'three';
import { ConeGeometry } from 'three';
import { CylinderGeometry } from 'three';
import type { DelayFill } from './types';
import { Euler } from 'three';
import { EventDispatcher } from 'three';
import { ExtrudeGeometry } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Group } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Material } from 'three';
import { Matrix4 } from 'three';
import { Mesh } from 'three';
import { MeshBasicMaterial } from 'three';
import type { Meta } from './types';
import type { NodeEventMap } from './types';
import type { NodePinsPair } from './types';
import * as Nodes from 'three/examples/jsm/nodes/Nodes';
import { Object3D } from 'three';
import { Object3DEventMap } from 'three';
import type { Object3DEventMap as Object3DEventMap_2 } from './types';
import type { ObjectsMap } from './types';
import type { ObjectsTransfer } from './types';
import { PerspectiveCamera } from 'three';
import type { PinValueType } from './types';
import { PlaneGeometry } from 'three';
import { Points } from 'three';
import { PositionalAudio } from 'three';
import type { ReflectorOptions } from 'three/examples/jsm/objects/Reflector';
import { Scene } from 'three';
import { ShaderMaterial } from 'three';
import { Shape as Shape_2 } from 'three';
import { SphereGeometry } from 'three';
import { Text as Text_2 } from 'troika-three-text';
import { TextProps } from 'troika-three-text';
import { Texture } from 'three';
import * as THREE from 'three';
import type { ThreeNode } from './types';
import { TorusGeometry } from 'three';
import { TorusKnotGeometry } from 'three';
import { Vector2 } from 'three';
import { Vector3 } from 'three';
import { Vector4 } from 'three';
import type { Water2Options } from 'three/examples/jsm//objects/Water2.js';
import { WebGLRenderer } from 'three';
import { WebGLRenderTarget } from 'three';

export declare function addEffectNode(name: string, title: string, props: EffectProps, code: string): void;

declare type AmmoBody = Ammo.btRigidBody;

declare type AnimationActionState = {
  isPending: boolean;
  action: AnimationAction;
  resolve: any;
};

export declare class AudioListener2 extends AudioListener {
  readonly isAudioListener2 = true;
  constructor();
  toJSON(meta: Meta): any;
}

export declare class BezierLine extends Line2 {
  readonly isBezierLine = true;
  readonly fromPosition: Vector3;
  readonly toPosition: Vector3;
  readonly ctrl1: Vector3;
  readonly ctrl2: Vector3;
  density: number;
  protected _tmpSize: Vector2;
  constructor();
  updatePositions(): void;
  serialize(json: any): void;
  deserialize(json: any): void;
}

export declare class BezierLineMaterial extends LineMaterial {
  readonly isBezierLineMaterial = true;
  constructor();
}

declare enum BodyType {
  Ghost = 0,
  RigidBody = 1
}

export declare class Box<TGeometry extends BoxGeometry = BoxGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isBox = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare const BuiltinObjectKeyHidden = "__isHidden";

export declare const BuiltinSceneSpawns = "[Spawns]";

export declare class Capsule<TGeometry extends CapsuleGeometry = CapsuleGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isCapsule = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare class Character<TGeometry extends CapsuleGeometry = CapsuleGeometry, TEventMap extends Object3DEventMap = Object3DEventMap> extends Model3D<TGeometry, TEventMap> {
  isCharacter: boolean;
  readonly actions: Record<string, AnimationActionState>;
  protected _mixer?: AnimationMixer;
  protected _clips: Array<AnimationClip>;
  protected _objectOrgSize: Vector3;
  constructor(geometry?: TGeometry, material?: MeshBasicMaterial, bodyType?: number, mass?: number);
  protected loadModel(): Promise<void>;
  act(name: string, loop?: boolean): Promise<boolean>;
  stop(name?: string): void;
}

export declare function clone<T extends Object3D = Object3D>(object: T, recursive?: boolean, root?: T): T;

export declare function cloneTracingBegin(): void;

export declare function cloneTracingEnd(): void;

export declare class Cone<TGeometry extends ConeGeometry = ConeGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isCone = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare class Cylinder<TGeometry extends CylinderGeometry = CylinderGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isCylinder = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare class EffectNode<T extends Object3D = Object3D> extends ScriptBlockNode<T> {
  readonly isEffectNode = true;
  constructor(_inst: string, props: EffectProps, code: string, object3d?: T);
  serialize(json: any): void;
}

declare type EffectProps = {
  in?: Record<string, PinTypeSupported>;
  out?: Record<string, PinTypeSupported>;
};

declare class Entity<TGeometry extends BufferGeometry = BoxGeometry, TMaterial extends Material | Material[] = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap, TGeoParams extends Record<string, any> = Record<string, any>> extends Mesh<TGeometry, TMaterial, TEventMap> implements PhysicalObject {
  protected _bodyType: BodyType;
  protected _mass: number;
  readonly isEntity = true;
  readonly geo: Writable<TGeoParams>;
  readonly geoMatrix: Matrix4;
  readonly physicalBody: AmmoBody;
  world?: PhysicalWorld;
  private _tmpAmmoVectorA;
  private _tmpAmmoQuaternion;
  constructor(geometry?: TGeometry, material?: TMaterial, _bodyType?: BodyType, _mass?: number);
  get mass(): number;
  set mass(val: number);
  get bodyType(): BodyType;
  set bodyType(val: BodyType);
  protected get parameters(): TGeoParams;
  moveTo(newPosition: Vector3): void;
  applyTranslation(position: Vector3): void;
  applyRotationFromEuler(euler: Euler): void;
  applyScale(scale: Vector3): void;
  applyGeoMatrix4(matrix: Matrix4): void;
  clone(recursive?: boolean | undefined): this;
  serialize(json: any): void;
  deserialize(json: any): void;
  dispose(): void;
  protected rebuildGeometry(): void;
  protected rebuildBody(): void;
  /**
   * Sets the babylon object's position/rotation from the physics body's position/rotation
   * @param impostor imposter containing the physics body and babylon object
   * @param newPosition new position
   * @param newRotation new rotation
   */
  private setPhysicsBodyTransformation;
}

declare type EventMap = NodeEventMap & Object3DEventMap_2;

export declare class Model3D<TGeometry extends SphereGeometry | CapsuleGeometry | BoxGeometry = SphereGeometry, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, MeshBasicMaterial, TEventMap> {
  isModel3D: boolean;
  protected _model: string;
  protected _modelRoot: GLTF | Group;
  protected _modeMatrix?: Matrix4;
  protected _object?: Object3D;
  protected _isLoading: boolean;
  protected _castShadowModel: boolean;
  protected _receiveShadowModel: boolean;
  protected _objectOrgSize: Vector3;
  constructor(geometry?: TGeometry, material?: MeshBasicMaterial, bodyType?: number, mass?: number);
  get model(): string;
  set model(newModel: string);
  protected loadModel(): Promise<void>;
  protected rebuildGeometry(): void;
  protected resizeObject(): void;
  protected objectAutoSize(): void;
  private updateModelShadow;
  toJSON(meta: Meta): Output;
  serialize(json: any): void;
  deserialize(json: any): void;
}

export declare function nodeProxy(node: ThreeNode, eventDispatcher: EventDispatcher<NodeEventMap & Object3DEventMap_2>): ThreeNode;

declare class ObjectNode<T extends Object3D | Texture = Object3D, VT extends PinValueType = PinValueType> extends Nodes.Node implements DelayFill {
  private readonly _inst;
  readonly objectType: string;
  readonly isObjectNode = true;
  readonly typesExtended: NodePinsPair<VT>;
  readonly isObject3DNode: boolean;
  eventDispatcher: EventDispatcher<EventMap> | null;
  protected _object: T;
  protected _objectRaw: T;
  constructor(_inst: string, objectType: string, object?: T);
  get object(): T;
  set object(o: T);
  getObjectsExtended<T1 extends ThreeNode | Object3D, T2 extends ThreeNode | Object3D>(): {
    in: T1;
    out: T2;
  };
  fill(root: Object3D, objects: ObjectsMap): void;
  dispose(): void;
  toJSON(meta: Meta): Nodes.AnyJson;
  serialize(json: any): void;
  deserialize(json: any): void;
  createDefault(currentObject: Object3D): void;
  protected initTypes(): void;
}

export declare const objectsTransferred: ObjectsTransfer<Object3D>;

declare type Output = {
  metadata: {
    version: 4.6;
    type: 'Object';
    generator: 'Object3D.toJSON';
  };
  geometries: Array<any>;
  materials: Array<any>;
  textures: Array<any>;
  images: Array<any>;
  shapes: Array<any>;
  skeletons: Array<any>;
  animations: Array<any>;
  nodes: Array<any>;
  listeners: Array<any>;
  object: Record<string, any>;
};

export declare class Particles<TMaterial extends Material = Material> extends Points<BufferGeometry, TMaterial> {
  readonly isParticles = true;
  mass: number;
  /** Resistance Coefficient */
  airResCoe: number;
  growSpeed: number;
  readonly spaceSize: Vector3;
  readonly bornSpaceSize: Vector3;
  readonly bornPoint: Vector3;
  private _count;
  private _countFired;
  private _positions;
  private _velocities;
  private _bornTime;
  constructor(geometry?: BufferGeometry, material?: TMaterial);
  get count(): number;
  set count(val: number);
  private rebuildBuffer;
  private update;
  private grow;
  private isOutofSpace;
  private randBornPoint;
  toJSON(meta: Meta): Output;
  protected serialize(json: any): void;
  protected deserialize(json: any): void;
}

declare interface PhysicalObject extends THREE.Mesh {
  world?: PhysicalWorld;
  mass: number;
}

export declare class PhysicalScene extends Scene {
  readonly isPhysicalScene = true;
  readonly physics: PhysicalWorld;
  readonly windForce: Vector3;
  /** to y axis */
  protected _gravity: number;
  private objectsTrash;
  constructor();
  get gravity(): number;
  set gravity(val: number);
  update(renderer: WebGLRenderer, camera: Camera, delta: number, now: number, globalOnly?: boolean): void;
  add(...object: Object3D<Object3DEventMap>[]): this;
  remove(...object: Object3D<Object3DEventMap>[]): this;
  serialize(json: any): void;
  deserialize(json: any): void;
  active(): void;
  deactive(): void;
  dispose(): void;
}

declare class PhysicalWorld {
  readonly world: Ammo.btDiscreteDynamicsWorld;
  private readonly collisionConfiguration;
  private readonly dispatcher;
  private readonly broadphase;
  private readonly solver;
  private readonly softBodySolver;
  private readonly softBodyHelpers;
  private readonly worldTransform;
  private destroyed;
  private meshes;
  private meshMap;
  private meshIdx;
  private conllisionMap;
  constructor(gravity?: number);
  dispose(): void;
  addMesh(mesh: PhysicalObject, body: AmmoBody | Array<AmmoBody>): void;
  removeMesh(mesh: PhysicalObject): void;
  findBody(mesh: PhysicalObject): Ammo.btRigidBody | Ammo.btRigidBody[] | undefined;
  setMeshPosition(mesh: PhysicalObject, position: THREE.Vector3, index?: number): void;
  detectCollision(): void;
  step(delta: number, now: number): void;
}

declare type PinTypeSupported = 'Boolean' | 'Number' | 'String' | 'Url' | 'Color' | 'Vector2' | 'Vector3' | 'Vector4' | 'Euler' | 'bool' | 'float' | 'color' | 'vec2' | 'vec3' | 'vec4';

declare type PinValueSupported = boolean | number | string | Color | Vector2 | Vector3 | Vector4 | Euler | Nodes.UniformNode;

export declare class Plane<TGeometry extends PlaneGeometry = PlaneGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isPlane = true;
  constructor(geometry?: TGeometry, material?: TMaterial);
}

export declare class PositionalAudio2 extends PositionalAudio {
  readonly isPositionalAudio2 = true;
  private _src;
  constructor(listener: AudioListener);
  get src(): string;
  set src(value: string);
  play(delay?: number | undefined): this;
  clone(recursive?: boolean | undefined): this;
  serialize(json: any): void;
  deserialize(json: any): void;
}

export declare class Reflector<TGeometry extends BufferGeometry = PlaneGeometry, TMaterial extends ShaderMaterial = ShaderMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Mesh<TGeometry, TMaterial, TEventMap> {
  readonly isReflector = true;
  readonly props: Required<ReflectorOptions>;
  readonly renderTarget: WebGLRenderTarget;
  protected camera: PerspectiveCamera;
  constructor(geometry?: TGeometry, material?: TMaterial);
  get color(): Color;
  set color(val: Color);
  get textureWidth(): number;
  set textureWidth(val: number);
  get textureHeight(): number;
  set textureHeight(val: number);
  get clipBias(): number;
  set clipBias(val: number);
  getRenderTarget(): WebGLRenderTarget<Texture>;
  dispose(): void;
  clone(recursive?: boolean | undefined): this;
  serialize(json: any): void;
  deserialize(json: any): void;
}

declare class ScriptBlockNode<T extends Object3D = Object3D> extends ScriptNode<T> {
  readonly isScriptBlockNode = true;
  protected _prev?: ScriptBlockNode;
  protected _next?: ScriptBlockNode;
  get prev(): ScriptBlockNode | undefined;
  set prev(v: ScriptBlockNode | undefined);
  get next(): ScriptBlockNode | undefined;
  set next(v: ScriptBlockNode | undefined);
  exec(e: Event): Promise<void>;
  fill(root: Object3D, objects: ObjectsMap): void;
  serialize(json: any): void;
  deserialize(json: any): void;
}

declare class ScriptNode<T extends Object3D = Object3D> extends ObjectNode<T, PinTypeSupported> {
  readonly editable: boolean;
  readonly isScriptNode = true;
  readonly inputs: ValueSet;
  readonly outputs: ValueSet;
  enabled: boolean;
  protected _parametersProps: string[];
  protected _parameters: Array<any>;
  protected _code: string;
  protected _main: Function;
  constructor(_inst: string, object3d?: T, editable?: boolean);
  get code(): string;
  set code(s: string);
  exec(e: Event): Promise<void>;
  getObjectsExtended<T1 extends ThreeNode | Object3D, T2 extends ThreeNode | Object3D>(): {
    in: T1;
    out: T2;
  };
  protected initTypes(): void;
  addInput(name: string, type: PinTypeSupported): PinValueSupported | undefined;
  removeInput(name: string): boolean;
  addOutput(name: string, type: PinTypeSupported): PinValueSupported | undefined;
  removeOutput(name: string): boolean;
  serialize(json: any): void;
  deserialize(json: any): void;
  protected compile(): Function;
}

declare class Shape<TGeometry extends ExtrudeGeometry = ExtrudeGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap, TProps extends ShapeProps = ShapeProps> extends Entity<TGeometry, TMaterial, TEventMap, ExtrudeGeometry['parameters']['options']> {
  readonly isShape = true;
  protected shapes: Shape_2[];
  protected props: TProps;
  constructor(geometry?: TGeometry, material?: TMaterial, props?: TProps, bodyType?: number, mass?: number);
  protected get parameters(): ExtrudeGeometry['parameters']['options'];
  clone(recursive?: boolean | undefined): this;
  serialize(json: any): void;
  deserialize(json: any): void;
  protected rebuildShapes(): void;
  protected rebuildGeometry(): void;
}

export declare class ShapeArc<TGeometry extends ExtrudeGeometry = ExtrudeGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Shape<TGeometry, TMaterial, TEventMap, {
  radius: number;
  innerRadius: number;
}> {
  readonly isShapeTriangle = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
  protected rebuildShapes(): void;
}

export declare class ShapeCircle<TGeometry extends ExtrudeGeometry = ExtrudeGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Shape<TGeometry, TMaterial, TEventMap, {
  radius: number;
}> {
  readonly isShapeTriangle = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
  protected rebuildShapes(): void;
}

declare type ShapeProps = Record<string, boolean | number | string | Color | Vector2 | Vector3 | Array<number> | null>;

export declare class ShapeRounded<TGeometry extends ExtrudeGeometry = ExtrudeGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Shape<TGeometry, TMaterial, TEventMap, {
  width: number;
  height: number;
  radius: number;
}> {
  readonly isShapeTriangle = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
  protected rebuildShapes(): void;
}

export declare class ShapeSquare<TGeometry extends ExtrudeGeometry = ExtrudeGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Shape<TGeometry, TMaterial, TEventMap, {
  size: number;
}> {
  readonly isShapeSquare = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
  protected rebuildShapes(): void;
}

export declare class ShapeTriangle<TGeometry extends ExtrudeGeometry = ExtrudeGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Shape<TGeometry, TMaterial, TEventMap, {
  vec1: Vector2;
  vec2: Vector2;
  vec3: Vector2;
}> {
  readonly isShapeTriangle = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
  protected rebuildShapes(): void;
}

export declare class SkyBox extends Mesh<BoxGeometry, ShaderMaterial> {
  readonly isSkyBox = true;
  private _renderTarget?;
  private _pmremGenerator?;
  private _sceneTmp;
  private _sceneRoot?;
  private _sun?;
  private _sunPosition;
  constructor(geometry?: BoxGeometry, material?: ShaderMaterial);
  get turbidity(): number;
  set turbidity(val: number);
  get rayleigh(): number;
  set rayleigh(val: number);
  get mieCoefficient(): number;
  set mieCoefficient(val: number);
  get mieDirectionalG(): number;
  set mieDirectionalG(val: number);
  get sunPosition(): Vector3;
  set sunPosition(val: Vector3);
  get sun(): Object3D;
  set sun(obj: Object3D);
  calSunPosition(elevation: number, azimuth: number): Vector3;
  updateSunPotision(): void;
  updateRenderTarget(): void;
  serialize(json: any): void;
  deserialize(json: any): void;
}

export declare class Sphere<TGeometry extends SphereGeometry = SphereGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isSphere = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare class StaticMesh<TEventMap extends Object3DEventMap = Object3DEventMap> extends Model3D<BoxGeometry, TEventMap> {
  constructor(geometry?: BoxGeometry, material?: MeshBasicMaterial, bodyType?: number, mass?: number);
  protected rebuildBody(): void;
}

export declare class Text3D<TMaterial extends Material = Material, TEventMap extends Object3DEventMap = Object3DEventMap> extends Shape<ExtrudeGeometry, TMaterial, TEventMap, Omit<TextProps, ''>> {
  readonly isText3D = true;
  constructor(geometry?: ExtrudeGeometry, material?: TMaterial);
  protected rebuildShapes(): Promise<void>;
}

export declare const textMembers: {
  [key in keyof TextProps]: string;
};

export declare class TextMesh extends Text_2 {
  readonly isTextMesh = true;
  constructor();
  serialize(json: any): void;
  deserialize(json: any): void;
}

export declare class Torus<TGeometry extends TorusGeometry = TorusGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isTorus = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare class TorusKnot<TGeometry extends TorusKnotGeometry = TorusKnotGeometry, TMaterial extends Material = MeshBasicMaterial, TEventMap extends Object3DEventMap = Object3DEventMap> extends Entity<TGeometry, TMaterial, TEventMap> {
  readonly isTorusKnot = true;
  constructor(geometry?: TGeometry, material?: TMaterial, bodyType?: number, mass?: number);
}

export declare class U3JsRuntime extends THREE.EventDispatcher {
  readonly context: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly clock: THREE.Clock;
  readonly size: {
    width: number;
    height: number;
  };
  readonly uuid: string;
  protected defaultScene: PhysicalScene;
  protected currentScene: PhysicalScene;
  protected currentCamera: THREE.Camera;
  protected defaultCamera: THREE.PerspectiveCamera;
  protected working: boolean;
  protected settings: WorldSettings;
  protected readonly scenes: Array<PhysicalScene>;
  protected spawns: PhysicalScene | undefined;
  constructor(context: HTMLCanvasElement);
  resize(width: number, height: number): void;
  navigateTo(name: string): void;
  createObjectFromSpawn(name: string): THREE.Object3D<THREE.Object3DEventMap> | undefined;
  setCamera(camera: THREE.Camera): void;
  load(url: string): Promise<void>;
  private render;
  run(): Promise<void>;
  dispose(): void;
}

declare type ValueSet = Record<string, PinValueSupported>;

export declare class WaterPlane extends Entity<PlaneGeometry, ShaderMaterial> {
  readonly isWaterPlane = true;
  readonly props: Required<Water2Options>;
  private textureMatrix;
  private reflector;
  private refractor;
  private refractorClipBias;
  constructor(geometry?: PlaneGeometry, material?: ShaderMaterial);
  get normalMap0(): Texture;
  set normalMap0(val: Texture);
  get normalMap1(): Texture;
  set normalMap1(val: Texture);
  get color(): Color;
  set color(val: Color);
  get textureWidth(): number;
  set textureWidth(val: number);
  get textureHeight(): number;
  set textureHeight(val: number);
  get clipBias(): number;
  set clipBias(val: number);
  get flowDirection(): Vector2;
  set flowDirection(val: Vector2);
  get flowSpeed(): number;
  set flowSpeed(val: number);
  get reflectivity(): number;
  set reflectivity(val: number);
  get waterScale(): number;
  set waterScale(val: number);
  appleProps(): void;
  clone(recursive?: boolean | undefined): this;
  serialize(json: any): void;
  deserialize(json: any): void;
  dispose(): void;
  protected rebuildGeometry(): void;
  private updateTextureMatrix;
  private updateFlow;
  private static WaterShader;
}

export declare interface WorldSettings {
  aspect: number | 'auto';
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
  shadowMap?: {
    enabled: boolean;
    type: THREE.ShadowMapType;
  };
}

declare type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export { }
