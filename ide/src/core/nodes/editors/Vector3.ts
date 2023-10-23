import { ConstNode } from 'three/examples/jsm/nodes/Nodes';
import type { GraphNode, HistoryManager } from 'u3js/src/types/types';
import { Element } from '../../../libs/flow';
import { Graph, } from 'u3js/src/extends/graph/graph';
import { InputEditor } from './input';
import { NodeEditorParams } from '../NodeEditor';
import { consumeChain } from '../elements/elements';

export class Vector3Editor extends InputEditor {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ConstNode>, params: NodeEditorParams) {
    super(name, history, graph, node, params);

    const element = consumeChain.Vector3(node.scoped, 'value', new Element(), 'Vector3', {}, []);
    element.addEventListener('changeInput', () => this.invalidate('value'));
    element.setInput(0);
    this.add(element);
  }
}
