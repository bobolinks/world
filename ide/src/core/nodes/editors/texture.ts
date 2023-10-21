import { CubeTexture, Texture } from "three";
import type { HistoryManager, GraphNode } from '../../u3js/types/types';
import { Graph, } from '../../u3js/extends/graph/graph';
import { ObjectNode } from "../../u3js/extends/nodes/object";
import { ObjectEditor } from "./object";
import { NodeEditorParams } from "../NodeEditor";

export class TextureEditor<T extends CubeTexture | Texture = Texture> extends ObjectEditor<T> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ObjectNode<T>>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: !node.scoped.isObject3DNode, input: 0, output: 1, ...params });

    const image = this.get('image');
    if (image) {
      image.setInput(0);
      image.setOutput(0);
    }
  }
}