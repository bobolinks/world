import type { GraphNode, HistoryManager } from '../../u3js/types/types';
import { ScriptBlockNode } from '../../u3js/extends/nodes/block';
import { Graph, } from '../../u3js/extends/graph/graph';
import { ScriptEditor } from './script';
import { NodeEditorParams } from '../NodeEditor';

export class BlockEditor<T extends ScriptBlockNode = ScriptBlockNode> extends ScriptEditor<T> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<T>, params: NodeEditorParams) {
    super(name, history, graph, node, { input: 1, output: 1, ...params });
  }
}
