import { Camera, EventDispatcher, Material, Object3D, Scene, Texture, WebGLRenderer } from "three";
import * as Nodes from "three/examples/jsm/nodes/Nodes";
import { NodeTypeOption, NodeValueOption } from "three/examples/jsm/nodes/Nodes";

// node types
declare type ThreeNode = Nodes.Node | Material;
declare type GPUNodeTypeName = NodeTypeOption;
declare type GPUNodeValueType = NodeValueOption;
declare type CPUNodeObjectValueTypeName = 'Audio' | 'Image' | 'Texture' | 'CubeTexture' | 'Material' | 'Object3D';
declare type CPUNodeObjectValueType = HTMLImageElement | Texture | Material | Object3D;
declare type CPUNodeValueTypeName = 'Boolean' | 'Number' | 'String' | 'Url' | 'Script' | 'Color' | 'Vector2' | 'Vector3' | 'Vector4' | 'Matrix3' | 'Matrix4' | 'Euler' | CPUNodeObjectValueTypeName;
declare type NodeTypeName = GPUNodeTypeName | CPUNodeValueTypeName;
declare type NodeValueType = GPUNodeValueType | CPUNodeObjectValueType;

// Pin types
declare type PinDirect = 'in' | 'out';
declare type PinEnum = { [key: string]: number } | Array<string>;
declare type PinValueType = NodeTypeName | PinEnum | null;
declare type NodePin<T extends PinDirect, VT extends PinValueType = PinValueType> = {
  /** type */
  types: Array<VT>;
  /** default is in */
  direct?: T;
  /** node name if haved */
  nname?: string;
};
declare type NodePins<T extends PinDirect, VT extends PinValueType = PinValueType> = Record<string, NodePin<T, VT>>;
declare type NodePinsPair<VT extends PinValueType = PinValueType> = {
  in: NodePins<'in', VT>;
  out: NodePins<'out', VT>;
}
declare type NodeProto<VT extends PinValueType = PinValueType> = NodePinsPair<VT> & {
  name: string;
  clsName: string;
}

//-------------------------------
// Serializer
declare type Meta = {
  geometries: { [key: string]: Nodes.AnyJson };
  materials: { [key: string]: Nodes.AnyJson };
  textures: { [key: string]: Nodes.AnyJson };
  images: { [key: string]: Nodes.AnyJson };
  shapes: { [key: string]: Nodes.AnyJson };
  skeletons: { [key: string]: Nodes.AnyJson };
  animations: { [key: string]: Nodes.AnyJson };
  nodes: { [key: string]: Nodes.AnyJson };
  listeners: { [key: string]: Nodes.AnyJson };
};

declare interface UUIDLike { uuid: string; }
declare type ObjectsTransfer<T extends UUIDLike = UUIDLike> = WeakMap<T, T>;
declare type ObjectsMap<T extends UUIDLike = UUIDLike> = Record<string /** uuid */, T>;
declare interface DelayFill {
  fill(root: Object3D, objects: ObjectsMap): void;
}
declare interface UpdatableNode {
  onUpdate(renderer: WebGLRenderer, camera: Camera, delta: number, now: number): void;
}

//-------------------------------

// common events
declare type UserNoticeLevel = 'error' | 'warning' | 'notice';
declare type UserEventName = 'userEventNotice';
declare type UserEventMap = {
  userEventNotice: { type: 'userEventNotice'; source?: EventDispatcher; level: UserNoticeLevel; message: string; };
};

// events for node
declare type NodeEventName = 'nodeEventAdded' | 'nodeEventRemoved' | 'nodeEventModified' | 'nodeEventInputChanged' | 'nodeEventOutputChanged';
declare type NodeEventMap = {
  nodeEventAdded: { type: 'nodeEventAdded'; source: EventDispatcher; nodes: Array<ThreeNode>; };
  nodeEventRemoved: { type: 'nodeEventRemoved'; source: EventDispatcher; nodes: Array<ThreeNode>; };
  nodeEventModified: { type: 'nodeEventModified'; source: EventDispatcher; node: ThreeNode; };
  nodeEventInputChanged: { type: 'nodeEventInputChanged'; source: EventDispatcher; node: ThreeNode; fields: Array<string>; };
  nodeEventOutputChanged: { type: 'nodeEventOutputChanged'; source: EventDispatcher; node: ThreeNode; fields: Array<string>; };
};

// events for object3d
declare type Object3DEventName = 'onBorn' | 'onDead' | 'onCollisionEnter' | 'onCollisionLeave';
declare type Object3DEventMap = {
  // when it added to scene
  onBorn: { type: 'onBorn'; source: EventDispatcher; object: Object3D; };
  // when it removed from scene
  onDead: { type: 'onDead'; source: EventDispatcher; object: Object3D; };
  onCollisionEnter: { type: 'onCollisionEnter'; source: EventDispatcher; object: Object3D; target: Object3D };
  onCollisionLeave: { type: 'onCollisionLeave'; source: EventDispatcher; object: Object3D; target: Object3D };
};

//-------------------------------
// for editor
declare type Anchor = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

//-------------------------------
// for bound link
declare enum BoundType {
  None = 0,
  Ref = 1,
  Push = 2,
  // for script block chain
  Chain = 3,
}

declare type BoundSlot = {
  // peer node
  node: GraphNode;
  /** bound type */
  type: BoundType.Ref | BoundType.Push;
  // field name of peer node
  field?: string;
};

declare type GraphNode<T extends ThreeNode = ThreeNode> = {
  // node name
  name: string;
  // node scoped
  scoped: T;
  // anchor
  anchor: Anchor;
  // properties bound
  bounds: { [key: string /* ${fieldName}|ext.${fieldName} */]: BoundSlot };
  // outs
  outs: { [key: string /* ${fieldName}|ext.${fieldName} */]: Array<BoundSlot & { field: string }>; };
};

declare type LinkPoint = {
  node: GraphNode<ThreeNode>;
  io?: PinDirect;
  field?: string;
};

declare type GraphEvent = 'graphAdded' | 'graphModified' | 'graphRemoved' | 'graphConnected' | 'graphDisconnected';

declare type GraphEventMap = {
  graphAdded: { type: GraphEvent; soure: EventDispatcher; nodes: Array<GraphNode> };
  graphModified: { type: GraphEvent; soure: EventDispatcher; nodes: Array<GraphNode> };
  graphRemoved: { type: GraphEvent; soure: EventDispatcher; nodes: Array<GraphNode> };
  graphConnected: { type: GraphEvent; soure: EventDispatcher; from: GraphNode; to: GraphNode; toPin?: string; };
  graphDisconnected: { type: GraphEvent; soure: EventDispatcher; from: GraphNode; to: GraphNode; toPin?: string; };
};

declare interface Graph extends EventDispatcher<GraphEventMap & UserEventMap & NodeEventMap> {
  addType(node: GraphNode<any>, name: string, type: string, io: PinDirect): boolean;
  removeType(node: GraphNode<any>, name: string, io: PinDirect): boolean;
}

//-------------------------------
declare interface DataKeyPoint {
  tip: string;
  undo(): void;
  redo(): void;
}

declare type HistoryEventName = 'historyChanged';
declare type HistoryEventMap = {
  historyChanged: { type: 'historyChanged'; source: EventDispatcher; };
};

declare interface HistoryManager extends EventDispatcher<HistoryEventMap> {
  setScene(scene: Scene): void;
  push(keypoint: DataKeyPoint): void;
  canUndo(): boolean;
  undo(): void;
  canRedo(): boolean;
  redo(): void;
}

// constants
declare const BuiltinSceneSpawns = '[Spawns]';
declare const BuiltinObjectKeyHidden = '__isHidden';
