import { ConstNode } from 'three/examples/jsm/nodes/Nodes';
import type { GraphNode, HistoryManager } from '../../u3js/types/types';
import { Element } from '../../../libs/flow';
import { Graph, } from '../../u3js/extends/graph/graph';
import { InputEditor } from './input';
import { NodeEditorParams } from '../NodeEditor';
import { consumeChain } from '../elements/elements';

export class Vector2Editor extends InputEditor {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ConstNode>, params: NodeEditorParams) {
    super(name, history, graph, node, params);

    const element = consumeChain.Vector2(node.scoped, 'value', new Element(), 'Vector2', {}, []);
    element.addEventListener('changeInput', () => this.invalidate('value'));
    element.setInput(0);
    this.add(element);
  }
}
