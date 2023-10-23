import type { HistoryManager, GraphNode } from 'u3js/src/types/types';
import { Graph, } from 'u3js/src/extends/graph/graph';
import { ObjectNode } from "u3js/src/extends/nodes/object";
import { ObjectEditor } from "./object";
import { NodeEditorParams } from "../NodeEditor";
import { parseDragParams } from "../../drags";
import { Input } from "../../../libs/flow";
import { Character } from 'u3js/src';

export class ModelEditor<T extends Character = Character> extends ObjectEditor<T> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ObjectNode<T>>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: !node.scoped.isObject3DNode, input: 0, output: 1, ...params });

    const model = this.get('model');
    if (model) {
      model.setInput(0);
      model.setOutput(0);

      const input: Input = model.inputs[0] as any;

      const inputDom = input.dom.querySelector('input') as HTMLInputElement;

      inputDom.ondrop = (e: DragEvent) => {
        const data = parseDragParams(e);
        if (!data || data.type !== 'dragFile' || data.mime !== 'model/*') {
          return;
        }
        if (data.path === input.getValue()) {
          return;
        }
        node.scoped.object.model = data.path;
        input.setValue(data.path, false);
        model.dispatchEvent(new Event('changeInput'));
      };
    }
  }
}