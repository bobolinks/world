import { Texture } from "three";
import type { GraphNode, HistoryManager } from 'u3js/src/types/types';
import { EventListenerNode } from "u3js/src/extends/nodes/event";
import { ObjectNode } from "u3js/src/extends/nodes/object";
import { ScriptNode } from "u3js/src/extends/nodes/script";
import { ScriptBlockNode } from "u3js/src/extends/nodes/block";
import { getClsName } from "u3js/src/extends/helper/clslib";
import { TextMesh } from "u3js/src/extends/three/text";
import { Graph, } from "u3js/src/extends/graph/graph";
import { NodeEditor, NodeEditorParams } from "../NodeEditor";
import { BooleanEditor } from "./Boolean";
import { ColorEditor } from "./Color";
import { FloatEditor } from "./Float";
import { ObjectEditor } from "./object";
import { StringEditor } from "./String";
import { TimerEditor } from "./Timer";
import { Vector2Editor } from "./Vector2";
import { Vector3Editor } from "./Vector3";
import { Vector4Editor } from "./Vector4";
import { EventListenerEditor } from "./event";
import { PropsEditor } from "./props";
import { ScriptEditor } from "./script";
import { BlockEditor } from "./block";
import { TextureEditor } from "./texture";
import { TextEditor } from "./text";
import { Model3D } from "u3js/src";
import { ModelEditor } from "./model";
import { KeyboardNode } from "u3js/src/extends/nodes/keyboard";

// type NodeValueOption = Color | Vector2 | Vector3 | Vector4 | Matrix3 | Matrix4 | boolean | number
const cls2Editor = {
  Color: ColorEditor,
  Vector2: Vector2Editor,
  Vector3: Vector3Editor,
  Vector4: Vector4Editor,
  Boolean: BooleanEditor,
  Number: FloatEditor,
  String: StringEditor,
};

const ins2Editor = {
  float: FloatEditor,
  timerLocal: TimerEditor,
  vec2: Vector2Editor,
  vec3: Vector3Editor,
  vec4: Vector4Editor,
};

export function createEditorFromNode(title: string, history: HistoryManager, graph: Graph, node: GraphNode<any>, params: NodeEditorParams): NodeEditor {
  let cls = ins2Editor[node.name as keyof typeof ins2Editor];
  if (cls) {
    return new cls(title, history, graph, node, params);
  }
  if (node.scoped.isInputNode && node.scoped.value) {
    const clsName = getClsName(node.scoped.value);
    cls = cls2Editor[clsName as keyof typeof cls2Editor];
    if (cls) {
      return new cls(title, history, graph, node, params);
    }
  }
  if (node.scoped instanceof EventListenerNode || node.scoped instanceof KeyboardNode) {
    return new EventListenerEditor(title, history, graph, node, params) as any;
  } else if (node.scoped instanceof ScriptBlockNode) {
    return new BlockEditor(title, history, graph, node, params) as any;
  } else if (node.scoped instanceof ScriptNode) {
    return new ScriptEditor(title, history, graph, node, params) as any;
  } else if (node.scoped instanceof ObjectNode) {
    if (node.scoped.object instanceof Texture) {
      return new TextureEditor(title, history, graph, node, params) as any;
    } else if (node.scoped.object instanceof TextMesh) {
      return new TextEditor(title, history, graph, node, params) as any;
    } else if (node.scoped.object instanceof Model3D) {
      return new ModelEditor(title, history, graph, node, params) as any;
    }
    return new ObjectEditor(title, history, graph, node, params) as any;
  }
  return new PropsEditor(title, history, graph, node, params);
}