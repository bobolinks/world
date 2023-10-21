import type { GraphNode, HistoryManager } from '../../u3js/types/types';
import { ConstNode } from 'three/examples/jsm/nodes/Nodes';
import { Graph, } from '../../u3js/extends/graph/graph';
import { Element } from '../../../libs/flow';
import { InputEditor } from './input';
import { NodeEditorParams } from '../NodeEditor';
import { consumeChain } from '../elements/elements';

export class BooleanEditor extends InputEditor {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ConstNode>, params: NodeEditorParams) {
    super(name, history, graph, node, params);

    const element = consumeChain.Boolean(node.scoped, 'value', new Element(), 'Boolean', {}, []);
    element.addEventListener('changeInput', () => this.invalidate('value'));
    element.setInput(0);
    this.add(element);
  }
}
