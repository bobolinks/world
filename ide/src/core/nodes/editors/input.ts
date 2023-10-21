import InputNode from 'three/examples/jsm/nodes/core/InputNode';
import type { GraphNode, HistoryManager } from '../../u3js/types/types';
import { Graph, } from '../../u3js/extends/graph/graph';
import { NodeEditor, NodeEditorParams } from '../NodeEditor';

export class InputEditor extends NodeEditor {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<InputNode>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: true, ...params });

    // eslint-disable-next-line no-sparse-arrays
    const [, num] = /(\d)+$/.exec(name) || [, '1'];
    if (num) {
      this.title.setOutput(Number.parseInt(num));
    }
  }
}
