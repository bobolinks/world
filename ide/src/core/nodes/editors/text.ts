import type { HistoryManager, GraphNode } from '../../u3js/types/types';
import { Graph, } from '../../u3js/extends/graph/graph';
import { ObjectNode } from "../../u3js/extends/nodes/object";
import { TextMesh } from "../../u3js/extends/three/text";
import { ObjectEditor } from "./object";
import { NodeEditorParams } from "../NodeEditor";
import { parseDragParams } from "../../drags";
import { Input } from "../../../libs/flow";

export class TextEditor<T extends TextMesh = TextMesh> extends ObjectEditor<T> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ObjectNode<T>>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: !node.scoped.isObject3DNode, input: 0, output: 1, ...params });

    const font = this.get('font');
    if (font) {
      font.setInput(0);
      font.setOutput(0);

      const input: Input = font.inputs[0] as any;

      const inputDom = input.dom.querySelector('input') as HTMLInputElement;

      inputDom.ondrop = (e: DragEvent) => {
        const data = parseDragParams(e);
        if (!data || data.type !== 'dragFile' || data.mime !== 'font/*') {
          return;
        }
        if (data.path === input.getValue()) {
          return;
        }
        node.scoped.object.font = data.path;
        input.setValue(data.path, false);
        font.dispatchEvent(new Event('changeInput'));
      };
    }
  }
}