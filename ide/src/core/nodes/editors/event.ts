import type { GraphNode, HistoryManager } from '../../u3js/types/types';
import { EventListenerNode } from '../../u3js/extends/nodes/event';
import { Graph, } from '../../u3js/extends/graph/graph';
import { NodeEditorParams } from '../NodeEditor';
import { BlockEditor } from './block';

export class EventListenerEditor extends BlockEditor<EventListenerNode> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<EventListenerNode>, params: NodeEditorParams) {
    super(name, history, graph, node, { input: 0, output: 1, ...params });
  }
}
